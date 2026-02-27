"use client"
import { useReducer, useCallback, useRef, useEffect } from "react"
import type { ActiveWorkoutState, ActiveWorkoutAction, ActiveExercise, ActiveSet } from "@/types"

const initialState: ActiveWorkoutState = {
  sessionId: null,
  routineId: null,
  name: "",
  startedAt: new Date(),
  exercises: [],
  currentExerciseIndex: 0,
  restTimerActive: false,
  restTimerSeconds: 90,
  restTimerRemaining: 0,
  isFinished: false,
}

function makeDefaultSet(setNumber: number): ActiveSet {
  return {
    setNumber,
    reps: null,
    weightKg: null,
    isWarmup: false,
    isDropSet: false,
    completed: false,
  }
}

function reducer(state: ActiveWorkoutState, action: ActiveWorkoutAction): ActiveWorkoutState {
  switch (action.type) {
    case "INIT_SESSION":
      return {
        ...initialState,
        sessionId: action.sessionId,
        routineId: action.routineId,
        name: action.name,
        startedAt: new Date(),
        exercises: action.exercises.map((ex) => ({
          ...ex,
          sets: Array.from({ length: 3 }, (_, i) => makeDefaultSet(i + 1)),
        })),
        currentExerciseIndex: 0,
      }

    case "ADD_SET": {
      const exs = [...state.exercises]
      const ex = { ...exs[action.exerciseIndex] }
      ex.sets = [...ex.sets, makeDefaultSet(ex.sets.length + 1)]
      exs[action.exerciseIndex] = ex
      return { ...state, exercises: exs }
    }

    case "UPDATE_SET": {
      const exs = [...state.exercises]
      const ex = { ...exs[action.exerciseIndex] }
      const updatedSets = [...ex.sets]
      updatedSets[action.setIndex] = {
        ...updatedSets[action.setIndex],
        [action.field]: action.value,
      }
      ex.sets = updatedSets
      exs[action.exerciseIndex] = ex
      return { ...state, exercises: exs }
    }

    case "COMPLETE_SET": {
      const exs = [...state.exercises]
      const ex = { ...exs[action.exerciseIndex] }
      const updatedSets = [...ex.sets]
      updatedSets[action.setIndex] = {
        ...updatedSets[action.setIndex],
        completed: true,
        id: action.loggedSetId,
      }
      ex.sets = updatedSets
      exs[action.exerciseIndex] = ex
      return { ...state, exercises: exs }
    }

    case "REMOVE_SET": {
      const exs = [...state.exercises]
      const ex = { ...exs[action.exerciseIndex] }
      const filteredSets = ex.sets.filter((_, i) => i !== action.setIndex)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
      ex.sets = filteredSets
      exs[action.exerciseIndex] = ex
      return { ...state, exercises: exs }
    }

    case "START_REST_TIMER":
      return {
        ...state,
        restTimerActive: true,
        restTimerSeconds: action.seconds,
        restTimerRemaining: action.seconds,
      }

    case "TICK_REST_TIMER":
      if (state.restTimerRemaining <= 1) {
        return { ...state, restTimerActive: false, restTimerRemaining: 0 }
      }
      return { ...state, restTimerRemaining: state.restTimerRemaining - 1 }

    case "STOP_REST_TIMER":
      return { ...state, restTimerActive: false, restTimerRemaining: 0 }

    case "SET_EXERCISE_INDEX":
      return { ...state, currentExerciseIndex: action.index }

    case "FINISH_SESSION":
      return { ...state, isFinished: true }

    case "RESET":
      return initialState

    default:
      return state
  }
}

export function useActiveWorkout() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  const initSession = useCallback(
    (sessionId: number, routineId: number | null, name: string, exercises: ActiveExercise[]) => {
      dispatch({ type: "INIT_SESSION", sessionId, routineId, name, exercises })
    },
    []
  )

  const addSet = useCallback((exerciseIndex: number) => {
    dispatch({ type: "ADD_SET", exerciseIndex })
  }, [])

  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, field: keyof ActiveSet, value: number | boolean | null) => {
      dispatch({ type: "UPDATE_SET", exerciseIndex, setIndex, field, value })
    },
    []
  )

  const completeSet = useCallback(
    async (exerciseIndex: number, setIndex: number) => {
      const ex = state.exercises[exerciseIndex]
      const set = ex.sets[setIndex]
      if (!state.sessionId || !ex.loggedExerciseId) return

      const res = await fetch(
        `/api/workouts/${state.sessionId}/exercises/${ex.loggedExerciseId}/sets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
            isWarmup: set.isWarmup,
            isDropSet: set.isDropSet,
            completedAt: new Date().toISOString(),
          }),
        }
      )
      if (res.ok) {
        const saved = await res.json()
        dispatch({ type: "COMPLETE_SET", exerciseIndex, setIndex, loggedSetId: saved.id })
        // Start rest timer
        dispatch({ type: "START_REST_TIMER", seconds: ex.restSeconds })
      }
    },
    [state.sessionId, state.exercises]
  )

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    dispatch({ type: "REMOVE_SET", exerciseIndex, setIndex })
  }, [])

  const finishSession = useCallback(async () => {
    if (!state.sessionId) return
    const durationSec = Math.floor((Date.now() - state.startedAt.getTime()) / 1000)
    await fetch(`/api/workouts/${state.sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finishedAt: new Date().toISOString(),
        durationSec,
      }),
    })
    dispatch({ type: "FINISH_SESSION" })
  }, [state.sessionId, state.startedAt])

  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  return {
    state,
    dispatch,
    initSession,
    addSet,
    updateSet,
    completeSet,
    removeSet,
    finishSession,
    reset,
  }
}
