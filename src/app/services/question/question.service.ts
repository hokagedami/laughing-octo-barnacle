import { Injectable } from '@angular/core';
import { Question } from '../../models/question.model';
import questions from '../../../../public/questionss.json';
import {UserService} from "../user/user.service";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private questionSize: number = parseInt(<string>process.env['QUESTION_SIZE']);
  private questionsType: string[] = process.env['QUESTIONS_TYPE']?.split(',') || [];
  private questions: Question[] = [];


  constructor(private userService: UserService) {
    this.loadQuestions();
  }

  loadQuestions() {
    this.questions = questions as Question[];
    this.questions = this.questions.filter(q => this.questionsType.includes(q.type));
  }

  getQuestions(): Question[] {
    this.loadQuestions();
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      const userLevel = currentUser.level;
      if (currentUser.progress[userLevel] < this.questionSize) {
        return this.questions
          .filter(q => q.level === userLevel)
          .sort(() => 0.5 - Math.random())
          .slice(0, this.questionSize - currentUser.progress[userLevel]);
      } else {
        // return next level questions
        if (userLevel === 'easy') {
          return this.questions
            .filter(q => q.level === 'medium')
            .sort(() => 0.5 - Math.random())
            .slice(0, this.questionSize);
        } else if (userLevel === 'medium') {
          return this.questions
            .filter(q => q.level === 'hard')
            .sort(() => 0.5 - Math.random())
            .slice(0, this.questionSize);
        } else {
          // return easy level questions
          return this.questions
            .filter(q => q.level === 'easy')
            .sort(() => 0.5 - Math.random())
            .slice(0, this.questionSize);
        }
      }
    }
    return [];
  }

  getQuestionById(id: number): Question | undefined {
    return this.questions.find(q => q.id === id);
  }
}
