import type { MealType, ExerciseCategory, Equipment } from "@/types";

export const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
  { value: "snack", label: "Snack", emoji: "🍎" },
];

export const EXERCISE_CATEGORIES: { value: ExerciseCategory; label: string; color: string }[] = [
  { value: "chest", label: "Chest", color: "#f87171" },
  { value: "back", label: "Back", color: "#60a5fa" },
  { value: "legs", label: "Legs", color: "#34d399" },
  { value: "shoulders", label: "Shoulders", color: "#a78bfa" },
  { value: "arms", label: "Arms", color: "#fb923c" },
  { value: "core", label: "Core", color: "#fbbf24" },
  { value: "cardio", label: "Cardio", color: "#f472b6" },
  { value: "other", label: "Other", color: "#94a3b8" },
];

export const EQUIPMENT_TYPES: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "machine", label: "Machine" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "cable", label: "Cable" },
  { value: "other", label: "Other" },
];

export const REST_TIMER_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
];

export const ROUTINE_COLORS = [
  "#a78bfa", // purple
  "#60a5fa", // blue
  "#34d399", // green
  "#fb923c", // orange
  "#f87171", // red
  "#fbbf24", // yellow
  "#f472b6", // pink
  "#94a3b8", // slate
];

export const GOAL_TYPES = [
  { value: "lose", label: "Lose Weight" },
  { value: "maintain", label: "Maintain Weight" },
  { value: "gain", label: "Gain Muscle" },
];

export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Light", description: "1-3 days/week" },
  { value: "moderate", label: "Moderate", description: "3-5 days/week" },
  { value: "active", label: "Active", description: "6-7 days/week" },
  { value: "veryActive", label: "Very Active", description: "Twice daily" },
];

export const MACRO_COLORS = {
  protein: "#a78bfa",
  carbs: "#60a5fa",
  fat: "#fb923c",
  calories: "#34d399",
};

export const HEATMAP_WEEKS = 52;
export const HEATMAP_DAYS = HEATMAP_WEEKS * 7; // 364 days
