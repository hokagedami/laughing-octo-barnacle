

export interface User {
  username: string;
  level: 'easy' | 'medium' | 'hard';
  progress: { easy: number, medium: number, hard: number };
  questionsAnswered: AnsweredQuestion[];
  challengeCompleted: boolean;
}

export interface AnsweredQuestion {
  questionId: number;
  selectedOption: string;
  answerIsCorrect: boolean;
}
