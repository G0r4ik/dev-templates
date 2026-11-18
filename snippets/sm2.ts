/**
 * SM-2 spaced repetition algorithm
 * quality: 0-5 (0 = complete blackout, 5 = perfect instant recall)
 */
export function calculateSM2(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number
) {
  let newInterval: number;
  let newRepetitions: number;

  if (quality >= 3) {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  let newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview: nextReview.toISOString().replace("T", " ").slice(0, 19),
  };
}

/** Preview: returns just the interval in days for each quality level */
export function previewInterval(
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number
): number {
  if (quality >= 3) {
    if (repetitions === 0) return 1;
    if (repetitions === 1) return 6;
    return Math.round(interval * easeFactor);
  }
  return 1;
}
