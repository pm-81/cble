import { flashcards as originalFlashcards, questions as originalQuestions } from './static-data';
import { expandedFlashcards } from './questions-expanded';
import { batch1Flashcards } from './flashcards-batch1';

import { expandedQuestions } from './questions-expanded';
import { batch2Questions } from './questions-batch2';
import { batch3Questions } from './questions-batch3';
import { batch4Questions } from './questions-batch4';

export const FALLBACK_FLASHCARDS = [
    ...originalFlashcards,
    ...expandedFlashcards,
    ...batch1Flashcards
].map((f, i) => ({
    id: `mock-f-${i}`,
    front: f.front,
    back: f.back,
    reference_cue: f.reference_cue,
    domain_id: 'mock-domain',
    is_active: true,
    domains: { name: 'General Knowledge' } // Mock join
}));

export const FALLBACK_QUESTIONS = [
    ...originalQuestions,
    ...expandedQuestions,
    ...batch2Questions,
    ...batch3Questions,
    ...batch4Questions
].map((q, i) => ({
    id: `mock-q-${i}`,
    stem: q.stem,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    option_e: q.option_e,
    correct_answer: q.correct_answer,
    rationale: q.rationale,
    reference_cue: q.reference_cue,
    domain_id: 'mock-domain',
    is_active: true
}));
