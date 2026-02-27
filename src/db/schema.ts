import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// USER PROFILE (single row, id always = 1)
// ─────────────────────────────────────────────
export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().default("Athlete"),
  weightKg: real("weight_kg"),
  heightCm: real("height_cm"),
  ageYears: integer("age_years"),
  biologicalSex: text("biological_sex").$type<"male" | "female" | "other">(),
  goalType: text("goal_type").$type<"lose" | "maintain" | "gain">(),
  activityLevel: text("activity_level").$type<
    "sedentary" | "light" | "moderate" | "active" | "veryActive"
  >(),
  targetCalories: integer("target_calories").notNull().default(2000),
  targetProteinG: real("target_protein_g").notNull().default(150),
  targetCarbsG: real("target_carbs_g").notNull().default(200),
  targetFatG: real("target_fat_g").notNull().default(65),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─────────────────────────────────────────────
// EXERCISE LIBRARY
// ─────────────────────────────────────────────
export const exercises = sqliteTable(
  "exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    category: text("category")
      .notNull()
      .$type<
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "arms"
        | "core"
        | "cardio"
        | "other"
      >(),
    equipment: text("equipment").$type<
      "barbell" | "dumbbell" | "machine" | "bodyweight" | "cable" | "other"
    >(),
    muscleGroup: text("muscle_group"),
    notes: text("notes"),
    isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    nameIdx: index("exercises_name_idx").on(t.name),
    categoryIdx: index("exercises_category_idx").on(t.category),
  })
);

// ─────────────────────────────────────────────
// WORKOUT ROUTINES (templates)
// ─────────────────────────────────────────────
export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#a78bfa"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─────────────────────────────────────────────
// ROUTINE EXERCISES (template line items)
// ─────────────────────────────────────────────
export const routineExercises = sqliteTable(
  "routine_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routineId: integer("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull().default(0),
    defaultSets: integer("default_sets").notNull().default(3),
    defaultRepsMin: integer("default_reps_min").notNull().default(8),
    defaultRepsMax: integer("default_reps_max").notNull().default(12),
    defaultWeightKg: real("default_weight_kg"),
    restSeconds: integer("rest_seconds").notNull().default(90),
    notes: text("notes"),
  },
  (t) => ({
    routineIdx: index("routine_exercises_routine_idx").on(t.routineId),
  })
);

// ─────────────────────────────────────────────
// WORKOUT SESSIONS
// ─────────────────────────────────────────────
export const workoutSessions = sqliteTable(
  "workout_sessions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routineId: integer("routine_id").references(() => routines.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp" }),
    durationSec: integer("duration_sec"),
    notes: text("notes"),
    bodyWeightKg: real("body_weight_kg"),
    dateStr: text("date_str").notNull(),
  },
  (t) => ({
    dateIdx: index("workout_sessions_date_idx").on(t.dateStr),
    startedIdx: index("workout_sessions_started_idx").on(t.startedAt),
  })
);

// ─────────────────────────────────────────────
// LOGGED EXERCISES (within a session)
// ─────────────────────────────────────────────
export const loggedExercises = sqliteTable(
  "logged_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id")
      .notNull()
      .references(() => workoutSessions.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    exerciseName: text("exercise_name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    notes: text("notes"),
  },
  (t) => ({
    sessionIdx: index("logged_exercises_session_idx").on(t.sessionId),
    exerciseIdx: index("logged_exercises_exercise_idx").on(t.exerciseId),
  })
);

// ─────────────────────────────────────────────
// SETS
// ─────────────────────────────────────────────
export const sets = sqliteTable(
  "sets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    loggedExerciseId: integer("logged_exercise_id")
      .notNull()
      .references(() => loggedExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps"),
    weightKg: real("weight_kg"),
    durationSec: integer("duration_sec"),
    distanceM: real("distance_m"),
    rpe: real("rpe"),
    isWarmup: integer("is_warmup", { mode: "boolean" }).notNull().default(false),
    isDropSet: integer("is_drop_set", { mode: "boolean" })
      .notNull()
      .default(false),
    isPersonalBest: integer("is_personal_best", { mode: "boolean" })
      .notNull()
      .default(false),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => ({
    loggedExIdx: index("sets_logged_exercise_idx").on(t.loggedExerciseId),
  })
);

// ─────────────────────────────────────────────
// FOOD DATABASE
// ─────────────────────────────────────────────
export const foods = sqliteTable(
  "foods",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    brand: text("brand"),
    servingSizeG: real("serving_size_g").notNull().default(100),
    servingUnit: text("serving_unit").notNull().default("g"),
    calories: real("calories").notNull(),
    proteinG: real("protein_g").notNull().default(0),
    carbsG: real("carbs_g").notNull().default(0),
    fatG: real("fat_g").notNull().default(0),
    fiberG: real("fiber_g"),
    sugarG: real("sugar_g"),
    sodiumMg: real("sodium_mg"),
    isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    nameIdx: index("foods_name_idx").on(t.name),
    brandIdx: index("foods_brand_idx").on(t.brand),
  })
);

// ─────────────────────────────────────────────
// FOOD LOG (daily entries)
// ─────────────────────────────────────────────
export const foodLog = sqliteTable(
  "food_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    dateStr: text("date_str").notNull(),
    mealType: text("meal_type")
      .notNull()
      .$type<"breakfast" | "lunch" | "dinner" | "snack">(),
    foodId: integer("food_id").references(() => foods.id, {
      onDelete: "set null",
    }),
    foodName: text("food_name").notNull(),
    servings: real("servings").notNull().default(1),
    servingSizeG: real("serving_size_g").notNull(),
    calories: real("calories").notNull(),
    proteinG: real("protein_g").notNull().default(0),
    carbsG: real("carbs_g").notNull().default(0),
    fatG: real("fat_g").notNull().default(0),
    fiberG: real("fiber_g"),
    loggedAt: integer("logged_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    dateIdx: index("food_log_date_idx").on(t.dateStr),
    mealIdx: index("food_log_meal_idx").on(t.dateStr, t.mealType),
  })
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const routinesRelations = relations(routines, ({ many }) => ({
  routineExercises: many(routineExercises),
  workoutSessions: many(workoutSessions),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  routineExercises: many(routineExercises),
  loggedExercises: many(loggedExercises),
}));

export const routineExercisesRelations = relations(
  routineExercises,
  ({ one }) => ({
    routine: one(routines, {
      fields: [routineExercises.routineId],
      references: [routines.id],
    }),
    exercise: one(exercises, {
      fields: [routineExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one, many }) => ({
    routine: one(routines, {
      fields: [workoutSessions.routineId],
      references: [routines.id],
    }),
    loggedExercises: many(loggedExercises),
  })
);

export const loggedExercisesRelations = relations(
  loggedExercises,
  ({ one, many }) => ({
    session: one(workoutSessions, {
      fields: [loggedExercises.sessionId],
      references: [workoutSessions.id],
    }),
    exercise: one(exercises, {
      fields: [loggedExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  loggedExercise: one(loggedExercises, {
    fields: [sets.loggedExerciseId],
    references: [loggedExercises.id],
  }),
}));

export const foodLogRelations = relations(foodLog, ({ one }) => ({
  food: one(foods, {
    fields: [foodLog.foodId],
    references: [foods.id],
  }),
}));

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type Profile = typeof profile.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type RoutineExercise = typeof routineExercises.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type NewWorkoutSession = typeof workoutSessions.$inferInsert;
export type LoggedExercise = typeof loggedExercises.$inferSelect;
export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type FoodLogEntry = typeof foodLog.$inferSelect;
export type NewFoodLogEntry = typeof foodLog.$inferInsert;
