import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Question } from '../../../models/question.model';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { TextAnswerComponent } from '../text-answer/text-answer.component';
import { CanvasTaskComponent } from '../canvas-task/canvas-task.component';
import { NgComponentOutlet, NgIf, TitleCasePipe } from '@angular/common';
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-current-level',
  templateUrl: './current-level.component.html',
  standalone: true,
  imports: [
    NgComponentOutlet,
    NgIf,
    TitleCasePipe,
    MultipleChoiceComponent,
    TextAnswerComponent,
    CanvasTaskComponent
  ],
  styleUrls: ['./current-level.component.css']
})
export class CurrentLevelComponent implements OnInit {

  constructor(private userService: UserService) {
  }

  @Input() questions: Question[] = [];
  @Input() currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  @Output() levelChange = new EventEmitter<string>();
  currentQuestionIndex: number = 0;
  challengeStarted: boolean = false;
  hasProgress: boolean = false;
  currentQuestionType: string = '';
  selectedAnswers: { [key: number]: string } = {};
  currentQuestion!: Question | null;
  levelCompleted: boolean = false;

  ngOnInit(): void {
    this.hasProgress = this.currentQuestionIndex > 0;
  }

  startChallenge(): void {
    this.challengeStarted = true;
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.currentQuestionType = this.currentQuestion.type;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
    } else {
      this.levelCompleted = true;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
    }
  }

  handleAnswerSelected(event: { questionId: number, selectedOption: string }): void {
    this.selectedAnswers[event.questionId] = event.selectedOption;
    if(this.selectedAnswers[event.questionId] === this.currentQuestion?.answer) {
      this.userService.updateQuestionsAnswered(event.questionId);
    }
  }

  goToNextLevel(): void {
    if (this.currentLevel === 'easy') {
      this.currentLevel = 'medium';
    } else if (this.currentLevel === 'medium') {
      this.currentLevel = 'hard';
    } else {
      alert('You have completed all levels!');
      return;
    }
    this.levelCompleted = false;
    this.currentQuestionIndex = 0;
    this.levelChange.emit(this.currentLevel);
    this.startChallenge();
  }

  endLevel() {
    this.levelCompleted = true;
  }
}
