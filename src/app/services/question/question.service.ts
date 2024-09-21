import { Injectable } from '@angular/core';
import { Question } from '../../models/question.model';
import questions from '../../../../public/questionss.json';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questions: Question[] = [];

  constructor() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.questions = questions as Question[];
  }

  getQuestions(level: 'easy' | 'medium' | 'hard'): Question[] {
    this.loadQuestions();
    return this.questions
      .filter(q => q.level === level)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  }

  getQuestionById(id: number): Question | undefined {
    return this.questions.find(q => q.id === id);
  }
}
