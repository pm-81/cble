import { questions, flashcards } from './src/lib/seed';
import { expandedQuestions, expandedFlashcards } from './src/lib/questions-expanded';
import { batch2Questions } from './src/lib/questions-batch2';
import { batch3Questions } from './src/lib/questions-batch3';
import { batch4Questions } from './src/lib/questions-batch4';
import { batch1Flashcards } from './src/lib/flashcards-batch1';

const allQuestions = [...questions, ...expandedQuestions, ...batch2Questions, ...batch3Questions, ...batch4Questions];
const allFlashcards = [...flashcards, ...expandedFlashcards, ...batch1Flashcards];

console.log(JSON.stringify({
    questions: allQuestions,
    flashcards: allFlashcards
}, null, 2));
