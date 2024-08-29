import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
  @ViewChild(MultipleChoiceComponent) multipleChoiceComponent!: MultipleChoiceComponent;
  @ViewChild(TextAnswerComponent) textAnswerComponent!: TextAnswerComponent;

  constructor(private userService: UserService) {
  }

  @Input() currentLevelQuestions: Question[] = [];
  @Input() currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  @Output() levelChange = new EventEmitter<string>();
  currentQuestionIndex: number = 0;
  challengeStarted: boolean = false;
  hasProgress: boolean = false;
  currentQuestionType: string = '';
  selectedAnswers: { [key: number]: string } = {};
  currentQuestion!: Question | null;
  levelCompleted: boolean = false;
  nextQuestionDisabled: boolean = true;
  correctTotal: number = 0;

  ngOnInit(): void {
    this.hasProgress = this.currentQuestionIndex > 0;
  }

  startChallenge(): void {
    this.challengeStarted = true;
    this.currentQuestion = this.currentLevelQuestions[this.currentQuestionIndex];
    this.currentQuestionType = this.currentQuestion.type;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.currentLevelQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.currentLevelQuestions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
      if (!this.userService.getCurrentUser()?.questionsAnswered.includes(this.currentQuestion.id)) {
        this.resetAnswerShown();
        this.nextQuestionDisabled = true;
      }
    } else {
      this.levelCompleted = true;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.currentLevelQuestions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
      if (!this.userService.getCurrentUser()?.questionsAnswered.includes(this.currentQuestion.id)) {
        this.resetAnswerShown();
      }
    }
  }

  handleAnswerSelected(event: { questionId: number, selectedOption: string }): void {
    this.selectedAnswers[event.questionId] = event.selectedOption;
    if (this.selectedAnswers[event.questionId] === this.currentQuestion?.answer) {
      this.correctTotal++;
    }
    if(this.selectedAnswers[event.questionId] === this.currentQuestion?.answer) {
      this.userService.updateQuestionsAnswered(event.questionId);
    }
    this.nextQuestionDisabled = false;
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
    this.correctTotal = 0;
    this.levelChange.emit(this.currentLevel);
    this.startChallenge();
  }

  endLevel() {
    this.levelCompleted = true;
  }

  resetAnswerShown() {
    switch (this.currentQuestionType) {
      case 'multiple-choice':
        this.multipleChoiceComponent.showAnswer = false;
        this.multipleChoiceComponent.selectedOption = null;
        break;
      case 'text-answer':
        this.textAnswerComponent.showAnswer = false;
        this.textAnswerComponent.userAnswer = '';
        break;
      case 'canvas-task':
        break;
    }
  }

  retakeLevel() {
    this.currentQuestionIndex = 0;
    this.levelCompleted = false;
    this.correctTotal = 0;
    this.levelChange.emit(this.currentLevel);
    this.startChallenge();
  }
}
