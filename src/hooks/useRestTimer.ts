"use client"
import { useState, useEffect, useRef, useCallback } from "react"

function playBeep(audioCtx: AudioContext, frequency = 880, duration = 0.2, volume = 0.4) {
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime)
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + duration)
}

function playCompletionSound(audioCtx: AudioContext) {
  // Three ascending beeps
  playBeep(audioCtx, 660, 0.15, 0.3)
  setTimeout(() => playBeep(audioCtx, 770, 0.15, 0.3), 180)
  setTimeout(() => playBeep(audioCtx, 880, 0.25, 0.4), 360)
}

interface RestTimerState {
  active: boolean
  remaining: number
  total: number
}

export function useRestTimer() {
  const [state, setState] = useState<RestTimerState>({ active: false, remaining: 0, total: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback(
    (seconds: number) => {
      clear()
      setState({ active: true, remaining: seconds, total: seconds })
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const next = prev.remaining - 1
          if (next <= 0) {
            clearInterval(intervalRef.current!)
            intervalRef.current = null
            // Play sound
            try {
              playCompletionSound(getAudioCtx())
              // Vibrate on mobile
              if ("vibrate" in navigator) navigator.vibrate([200, 100, 200])
            } catch { /* audio blocked */ }
            return { active: false, remaining: 0, total: prev.total }
          }
          // Tick beep at 3 seconds
          if (next <= 3) {
            try { playBeep(getAudioCtx(), 440, 0.1, 0.15) } catch { /* */ }
          }
          return { ...prev, remaining: next }
        })
      }, 1000)
    },
    [clear, getAudioCtx]
  )

  const stop = useCallback(() => {
    clear()
    setState({ active: false, remaining: 0, total: 0 })
  }, [clear])

  useEffect(() => () => clear(), [clear])

  return { ...state, start, stop }
}
