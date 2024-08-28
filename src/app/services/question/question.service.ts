import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Question } from '../../models/question.model';
import questions from '../../../../public/questions.json';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private questions: Question[] = [];
  private readonly questionFile = 'public/questions.json';

  constructor(private http: HttpClient) {
    this.loadQuestions();
  }

  // load questions from questions.json file in the assets folder
  loadQuestions() {
    // this.http.get<Question[]>(this.questionFile).pipe(
    //   catchError(error => {
    //     console.error('Error loading questions:', error);
    //     return of([]);
    //   })
    // ).subscribe(questions => {
    //   this.questions = questions;
    // });
    this.questions = questions as Question[];
  }

  getQuestions(level: 'easy' | 'medium' | 'hard', answered: number []): Question[] {
    this.loadQuestions();
    return this.questions
      .filter(q => q.level === level && !answered.includes(q.id))
      .sort(() => 0.5 - Math.random())
      .slice(0, 20 - answered.length);
  }
}
