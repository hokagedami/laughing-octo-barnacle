import { Injectable } from '@angular/core';
import { Question } from '../../models/question.model';
import questions from '../../../../public/questionss.json';
import {UserService} from "../user/user.service";
import {ConfigService} from "../config/config.service";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private questionSize: number = 5;
  private questionsType: string[] = [];
  private questions: Question[] = [];


  constructor(private userService: UserService, private configService: ConfigService) {
    this.loadQuestions();
  }

  loadQuestions() {
    return new Promise<void>((resolve, reject) => {
      this.loadConfig().then(r => {
        this.questions = questions as Question[];
        this.questions = this.questions.filter(q => this.questionsType.includes(q.type));
        resolve();
      }).catch(error => {
        console.error('Error loading questions:', error);
        reject(error);
      });
    });
  }

  async getQuestions(): Promise<Question[]> {
    try {
      await this.loadQuestions();
      const currentUser = this.userService.getCurrentUser();
      if (currentUser) {
        const userLevel = currentUser.level;
        if (currentUser.progress[userLevel] < this.questionSize) {
          return this.questions
            .filter(q => q.level === userLevel && this.questionsType.includes(q.type))
            .sort(() => 0.5 - Math.random())
            .slice(0, this.questionSize - currentUser.progress[userLevel]);
        } else {
          // return next level questions
          if (userLevel === 'easy') {
            return this.questions
              .filter(q => q.level === 'medium' && this.questionsType.includes(q.type))
              .sort(() => 0.5 - Math.random())
              .slice(0, this.questionSize);
          } else if (userLevel === 'medium') {
            return this.questions
              .filter(q => q.level === 'hard' && this.questionsType.includes(q.type))
              .sort(() => 0.5 - Math.random())
              .slice(0, this.questionSize);
          } else {
            // return easy level questions
            return this.questions
              .filter(q => q.level === 'easy' && this.questionsType.includes(q.type))
              .sort(() => 0.5 - Math.random())
              .slice(0, this.questionSize);
          }
        }
      }
      return [];
    } catch (error) {
      console.error('Error loading questions:', error);
      return [];
    }
  }

  getQuestionById(id: number): Question | undefined {
    return this.questions.find(q => q.id === id);
  }

  private loadConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.configService.getConfigs()
        .then(configs => {
          const questionSizeConfig = configs.find(c => c.name === 'questionSize');
          if (questionSizeConfig) {
            this.questionSize = parseInt(questionSizeConfig.value);
          }
          const multipleChoiceConfig = configs.find(c => c.name === 'multiple-choice');
          const textAnswerConfig = configs.find(c => c.name === 'text-answer');
          const canvasTaskConfig = configs.find(c => c.name === 'canvas-task');

          this.questionsType = [];
          if (multipleChoiceConfig?.value === 'true') {
            this.questionsType.push('multiple-choice');
          }
          if (textAnswerConfig?.value === 'true') {
            this.questionsType.push('text-answer');
          }
          if (canvasTaskConfig?.value === 'true') {
            this.questionsType.push('canvas-task');
          }
          resolve();
        })
        .catch(error => {
          console.error('Error loading config:', error);
          reject(error);
        });
    });
  }
}
