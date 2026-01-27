import { SM2Result } from '@/types/database';

/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Adapted for the CBLE Exam Prep application
 * 
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but remembered upon seeing answer
 * 2 - Incorrect, but answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect response, instant recall
 */

export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Input {
  quality: SM2Quality;
  previousEaseFactor: number;
  previousInterval: number;
  previousRepetitions: number;
}

/**
 * Calculate the next review parameters using SM-2 algorithm
 */
export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, previousEaseFactor, previousInterval, previousRepetitions } = input;
  
  let newEaseFactor = previousEaseFactor;
  let newInterval = previousInterval;
  let newRepetitions = previousRepetitions;

  // If quality < 3 (incorrect answer), reset repetitions
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor doesn't go below 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }

    // Calculate new interval
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }

    newRepetitions = previousRepetitions + 1;
  }

  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
    dueDate,
  };
}

/**
 * Convert user self-rating to SM2 quality
 * 
 * User ratings (1-4):
 * 1 - Again (forgot)
 * 2 - Hard (struggled)
 * 3 - Good (correct with effort)
 * 4 - Easy (instant recall)
 */
export function userRatingToSM2Quality(
  userRating: 1 | 2 | 3 | 4,
  isCorrect: boolean
): SM2Quality {
  if (!isCorrect) {
    return userRating === 1 ? 0 : 1;
  }
  
  switch (userRating) {
    case 1: return 2; // Correct but forgot initially
    case 2: return 3; // Correct with difficulty
    case 3: return 4; // Correct after hesitation
    case 4: return 5; // Perfect
    default: return 3;
  }
}

/**
 * Convert flashcard rating string to SM2 quality
 */
export function ratingToQuality(rating: 'again' | 'hard' | 'good' | 'easy'): SM2Quality {
  switch (rating) {
    case 'again': return 0;
    case 'hard': return 3;
    case 'good': return 4;
    case 'easy': return 5;
    default: return 3;
  }
}

/**
 * Calculate mastery level (0-5) based on performance metrics
 */
export function calculateMasteryLevel(
  totalAttempts: number,
  correctAttempts: number,
  averageConfidence: number,
  recentStreak: number
): number {
  if (totalAttempts === 0) return 0;
  
  const accuracy = correctAttempts / totalAttempts;
  const confidenceNormalized = (averageConfidence - 1) / 4; // Normalize 1-5 to 0-1
  
  // Weighted score combining accuracy, confidence, and streak
  const score = (
    accuracy * 0.5 +
    confidenceNormalized * 0.2 +
    Math.min(recentStreak / 5, 1) * 0.3
  );
  
  // Map to mastery levels
  if (score < 0.2) return 0;
  if (score < 0.4) return 1;
  if (score < 0.55) return 2;
  if (score < 0.7) return 3;
  if (score < 0.85) return 4;
  return 5;
}

/**
 * Get mastery level label
 */
export function getMasteryLabel(level: number): string {
  const labels = [
    'Novice',
    'Beginner',
    'Intermediate',
    'Proficient',
    'Advanced',
    'Expert'
  ];
  return labels[Math.min(level, 5)];
}

/**
 * Get mastery level color class
 */
export function getMasteryColor(level: number): string {
  const colors = [
    'text-muted-foreground',
    'text-destructive',
    'text-warning',
    'text-info',
    'text-success',
    'text-primary'
  ];
  return colors[Math.min(level, 5)];
}

/**
 * Calculate overconfidence score
 * Returns a value from -1 (underconfident) to 1 (overconfident)
 */
export function calculateOverconfidence(
  averageConfidence: number,
  accuracy: number
): number {
  // Normalize confidence to 0-1 scale (from 1-5)
  const confidenceNormalized = (averageConfidence - 1) / 4;
  
  // Difference between confidence and accuracy
  return confidenceNormalized - accuracy;
}

/**
 * Get items due for review
 */
export function getItemsDueForReview<T extends { due_date: string | null }>(
  items: T[],
  now: Date = new Date()
): T[] {
  return items.filter(item => {
    if (!item.due_date) return true; // New items are always due
    return new Date(item.due_date) <= now;
  });
}

/**
 * Priority queue for adaptive quiz selection
 * Prioritizes: due items > weak areas > low confidence > random
 */
export interface PriorityItem {
  id: string;
  isDue: boolean;
  masteryLevel: number;
  lastAttemptCorrect: boolean | null;
  daysSinceLastAttempt: number | null;
}

export function calculateItemPriority(item: PriorityItem): number {
  let priority = 0;
  
  // Due items get highest priority
  if (item.isDue) priority += 100;
  
  // Lower mastery = higher priority
  priority += (5 - item.masteryLevel) * 10;
  
  // Failed items get priority boost
  if (item.lastAttemptCorrect === false) priority += 30;
  
  // Items not seen recently get priority
  if (item.daysSinceLastAttempt !== null) {
    priority += Math.min(item.daysSinceLastAttempt, 30);
  } else {
    priority += 50; // Never seen items
  }
  
  // Add small random factor for variety
  priority += Math.random() * 5;
  
  return priority;
}

/**
 * Select questions for a study session
 */
export function selectQuestionsForSession<T extends { id: string }>(
  questions: T[],
  priorities: Map<string, number>,
  count: number,
  maxConsecutiveSameDomain: number = 3,
  domainMap?: Map<string, string>
): T[] {
  // Sort by priority
  const sorted = [...questions].sort((a, b) => {
    const priorityA = priorities.get(a.id) || 0;
    const priorityB = priorities.get(b.id) || 0;
    return priorityB - priorityA;
  });
  
  if (!domainMap) {
    return sorted.slice(0, count);
  }
  
  // Apply interleaving constraint
  const selected: T[] = [];
  const domainStreak: Map<string, number> = new Map();
  let lastDomain: string | null = null;
  
  for (const question of sorted) {
    if (selected.length >= count) break;
    
    const domain = domainMap.get(question.id) || 'unknown';
    const currentStreak = domain === lastDomain ? (domainStreak.get(domain) || 0) + 1 : 1;
    
    if (currentStreak <= maxConsecutiveSameDomain) {
      selected.push(question);
      domainStreak.set(domain, currentStreak);
      lastDomain = domain;
    }
  }
  
  return selected;
}
