import {Component, OnInit} from '@angular/core';
import {User} from "../../../models/user.model";
import {Question} from "../../../models/question.model";
import {UserService} from "../../../services/user/user.service";
import {QuestionService} from "../../../services/question/question.service";
import {MultipleChoiceComponent} from '../multiple-choice/multiple-choice.component';
import {TextAnswerComponent} from '../text-answer/text-answer.component';
import {CanvasTaskComponent} from '../canvas-task/canvas-task.component';
import {NgComponentOutlet, NgIf} from "@angular/common";

@Component({
  selector: 'app-challenges-home',
  standalone: true,
  imports: [
    NgComponentOutlet,
    NgIf
  ],
  templateUrl: './challenges-home.component.html',
  styleUrl: './challenges-home.component.css'
})
export class ChallengesHomeComponent implements OnInit {
  user: User | null = null;
  questions: Question[] = [];
  currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  currentQuestionIndex: number = 0;
  currentQuestion: Question | null = null;
  nextQuestionButtonDisabled: boolean = false;
  previousQuestionButtonDisabled: boolean = true;

  private componentMapping: { [key: string]: any } = {
    'multiple-choice': MultipleChoiceComponent,
    'text-answer': TextAnswerComponent,
    'canvas-task': CanvasTaskComponent
  };

  constructor(private userService: UserService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.loadQuestions();
      if (this.questions.length > 0) {
        this.currentQuestion = this.questions[0];
      }
    }
  }

  loadQuestions(): void {
    if (this.user) {
      this.questions = this.questionService.getQuestions(this.user.level, this.user.questionsAnswered);
    }
  }

  getComponentForQuestionType(type: string): any {
    return this.componentMapping[type];
  }

  nextQuestion(): void {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.completeLevel();
      return;
    }
    this.currentQuestion = this.questions[this.currentQuestionIndex];
  }

  previousQuestion(): void {
    this.currentQuestionIndex--;
    if (this.currentQuestionIndex < 0) {
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
    }
  }

  completeLevel(): void {
    if (this.user) {
      this.userService.updateProgress(this.currentLevel, this.currentQuestionIndex);
      if (this.currentLevel === 'easy') {
        this.currentLevel = 'medium';
      } else if (this.currentLevel === 'medium') {
        this.currentLevel = 'hard';
      } else {
        alert('Congratulations! You have completed all levels!');
      }
      this.loadQuestions();
    }
  }
}
