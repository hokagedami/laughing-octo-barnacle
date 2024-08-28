


export interface Question {
  id: number;
  level: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'text-answer' | 'canvas-task';
  content: string;
  options?: string[];  // For multiple-choice
  answer: string;
}
