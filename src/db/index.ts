import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.DATABASE_URL ?? path.join(process.cwd(), "fittrack.db");

// Singleton pattern — reuse the same connection across hot reloads in dev
const globalForDb = globalThis as unknown as { db: ReturnType<typeof drizzle> | undefined };

function createDb() {
  const sqlite = new Database(DB_PATH);

  // Performance pragmas
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("cache_size = -32000"); // 32MB cache
  sqlite.pragma("temp_store = MEMORY");

  // Run migrations inline (create tables if not exist)
  runMigrations(sqlite);

  return drizzle(sqlite, { schema });
}

function runMigrations(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Athlete',
      weight_kg REAL,
      height_cm REAL,
      age_years INTEGER,
      biological_sex TEXT,
      goal_type TEXT,
      activity_level TEXT,
      target_calories INTEGER NOT NULL DEFAULT 2000,
      target_protein_g REAL NOT NULL DEFAULT 150,
      target_carbs_g REAL NOT NULL DEFAULT 200,
      target_fat_g REAL NOT NULL DEFAULT 65,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    INSERT OR IGNORE INTO profile (id, name) VALUES (1, 'Athlete');

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      equipment TEXT,
      muscle_group TEXT,
      notes TEXT,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS exercises_name_idx ON exercises(name);
    CREATE INDEX IF NOT EXISTS exercises_category_idx ON exercises(category);

    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL DEFAULT '#a78bfa',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS routine_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      default_sets INTEGER NOT NULL DEFAULT 3,
      default_reps_min INTEGER NOT NULL DEFAULT 8,
      default_reps_max INTEGER NOT NULL DEFAULT 12,
      default_weight_kg REAL,
      rest_seconds INTEGER NOT NULL DEFAULT 90,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS routine_exercises_routine_idx ON routine_exercises(routine_id);

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      routine_id INTEGER REFERENCES routines(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      duration_sec INTEGER,
      notes TEXT,
      body_weight_kg REAL,
      date_str TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS workout_sessions_date_idx ON workout_sessions(date_str);
    CREATE INDEX IF NOT EXISTS workout_sessions_started_idx ON workout_sessions(started_at);

    CREATE TABLE IF NOT EXISTS logged_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
      exercise_name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS logged_exercises_session_idx ON logged_exercises(session_id);
    CREATE INDEX IF NOT EXISTS logged_exercises_exercise_idx ON logged_exercises(exercise_id);

    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      logged_exercise_id INTEGER NOT NULL REFERENCES logged_exercises(id) ON DELETE CASCADE,
      set_number INTEGER NOT NULL,
      reps INTEGER,
      weight_kg REAL,
      duration_sec INTEGER,
      distance_m REAL,
      rpe REAL,
      is_warmup INTEGER NOT NULL DEFAULT 0,
      is_drop_set INTEGER NOT NULL DEFAULT 0,
      is_personal_best INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS sets_logged_exercise_idx ON sets(logged_exercise_id);

    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      serving_size_g REAL NOT NULL DEFAULT 100,
      serving_unit TEXT NOT NULL DEFAULT 'g',
      calories REAL NOT NULL,
      protein_g REAL NOT NULL DEFAULT 0,
      carbs_g REAL NOT NULL DEFAULT 0,
      fat_g REAL NOT NULL DEFAULT 0,
      fiber_g REAL,
      sugar_g REAL,
      sodium_mg REAL,
      is_custom INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS foods_name_idx ON foods(name);
    CREATE INDEX IF NOT EXISTS foods_brand_idx ON foods(brand);

    CREATE TABLE IF NOT EXISTS food_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_str TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      food_id INTEGER REFERENCES foods(id) ON DELETE SET NULL,
      food_name TEXT NOT NULL,
      servings REAL NOT NULL DEFAULT 1,
      serving_size_g REAL NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL DEFAULT 0,
      carbs_g REAL NOT NULL DEFAULT 0,
      fat_g REAL NOT NULL DEFAULT 0,
      fiber_g REAL,
      logged_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS food_log_date_idx ON food_log(date_str);
    CREATE INDEX IF NOT EXISTS food_log_meal_idx ON food_log(date_str, meal_type);
  `);
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
