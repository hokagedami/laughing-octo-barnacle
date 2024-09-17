import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Question } from '../../../models/question.model';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { TextAnswerComponent } from '../text-answer/text-answer.component';
import { CanvasTaskComponent } from '../canvas-task/canvas-task.component';
import { NgComponentOutlet, NgIf, TitleCasePipe } from '@angular/common';
import {UserService} from "../../../services/user/user.service";
import {QuestionService} from "../../../services/question/question.service";
import confetti from 'canvas-confetti';

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
export class CurrentLevelComponent implements OnInit, OnDestroy{
  @ViewChild(MultipleChoiceComponent) multipleChoiceComponent!: MultipleChoiceComponent;
  @ViewChild(TextAnswerComponent) textAnswerComponent!: TextAnswerComponent;
  @ViewChild(CanvasTaskComponent) canvasTaskComponent!: CanvasTaskComponent;

  constructor(private userService: UserService, private questionService: QuestionService) {
  }
  @Input() currentLevelQuestions: Question[] = [];
  @Input() userCurrentLevel!: 'easy' | 'medium' | 'hard';
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
  challengeCompleted: boolean = false;
  private confettiInterval: any;
  isConfettiActive = false;
  showResult: boolean = false;
  NextButtonText: string = 'Next';
  disablePreviousButton: boolean = false;

  ngOnInit(): void {
    this.hasProgress = this.currentQuestionIndex > 0;
  }

  ngOnDestroy() {
    confetti.reset();
    this.stopConfetti();
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
      this.nextQuestionDisabled = true;
      this.resetPageForNextQuestion();
      if (this.currentQuestionIndex === this.currentLevelQuestions.length - 1) {
        this.NextButtonText = 'Finish';
      }
    } else {
      this.showResult = true;
      this.endChallenge();
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.currentLevelQuestions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
      this.NextButtonText = 'Next';
      if (this.selectedAnswers[this.currentQuestion.id]) {
        switch (this.currentQuestionType) {
          case 'multiple-choice':
            this.multipleChoiceComponent.selectedOption = this.selectedAnswers[this.currentQuestion.id];
            this.multipleChoiceComponent.showAnswer = true;
            break;
          case 'text-answer':
            this.textAnswerComponent.userAnswer = this.selectedAnswers[this.currentQuestion.id];
            this.textAnswerComponent.showAnswer = true;
            break;
          case 'canvas-task':
            this.canvasTaskComponent.canvasShot = this.selectedAnswers[this.currentQuestion.id];
            this.canvasTaskComponent.showAnswer = true;
            this.canvasTaskComponent.showSubmitButton = false;
            break;
        }
      }
      this.nextQuestionDisabled = false;
    }
  }

  async handleAnswerSelected(event: { questionId: number, selectedOption: string }): Promise<void> {
    this.selectedAnswers[event.questionId] = event.selectedOption;
    const answerIsCorrect = await this.checkAnswer(event.questionId);

    switch (this.currentQuestionType) {
      case 'multiple-choice':
        if (answerIsCorrect) {
          this.correctTotal++;
          this.userService.updateProgress(this.userCurrentLevel, this.correctTotal);
        }
        this.userService.updateUser(event.questionId, event.selectedOption, answerIsCorrect);
        break;
      case 'text-answer':
        if (answerIsCorrect) {
          this.correctTotal++;
          this.userService.updateProgress(this.userCurrentLevel, this.correctTotal);
        }
        this.userService.updateUser(event.questionId, event.selectedOption, answerIsCorrect);
        break;
      case 'canvas-task':
        if (answerIsCorrect) {
          this.correctTotal++;
          this.userService.updateProgress(this.userCurrentLevel, this.correctTotal);
        }
        this.userService.updateUser(event.questionId, event.selectedOption, answerIsCorrect);
        break;
      default:
        console.error('Unknown question type:', this.currentQuestionType);
        return;
    }
    this.nextQuestionDisabled = false;
  }

  goToNextLevel(): void {
    if (this.userCurrentLevel === 'easy') {
      this.userCurrentLevel = 'medium';
    } else if (this.userCurrentLevel === 'medium') {
      this.userCurrentLevel = 'hard';
    } else {
     this.endChallenge();
     return;
    }
    this.levelCompleted = false;
    this.currentQuestionIndex = 0;
    this.correctTotal = 0;
    this.NextButtonText = 'Next';
    this.showResult = false;
    this.levelChange.emit(this.userCurrentLevel);
    this.startChallenge();
  }

  resetPageForNextQuestion() {
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
        this.canvasTaskComponent.showAnswer = false;
        this.canvasTaskComponent.canvasShot = null;
        this.canvasTaskComponent.showSubmitButton = true;
        break;
    }
  }

  endChallenge() {
    this.levelCompleted = true;
    if (this.correctTotal === this.currentLevelQuestions.length && this.userCurrentLevel === 'hard') {
      this.challengeCompleted = true;
      this.toggleConfetti();
    }
  }

  retakeLevel() {
    this.userService.updateProgress(this.userCurrentLevel, 0);
    this.currentQuestionIndex = 0;
    this.levelCompleted = false;
    this.correctTotal = 0;
    this.NextButtonText = 'Next';
    this.showResult = false;
    this.levelChange.emit(this.userCurrentLevel);
    this.startChallenge();
  }

  toggleConfetti() {
    if (this.isConfettiActive) {
      this.stopConfetti();
    } else {
      this.startContinuousConfetti();
    }
  }

  startContinuousConfetti() {
    if (this.isConfettiActive) return;

    this.isConfettiActive = true;
    this.confettiInterval = setInterval(() => {
      confetti({
        particleCount: 100,
        spread: 360,
        origin: { y: 0.6 }
      });
    }, 250);
  }

  stopConfetti() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
      this.confettiInterval = null;
    }
    this.isConfettiActive = false;
  }

  async checkAnswer(questionId: number): Promise<boolean> {
    const question = this.questionService.getQuestionById(questionId);
    if (!question) {
      return false;
    }

    switch (question.type) {
      case 'multiple-choice':
        return this.selectedAnswers[questionId] === question.answer;
      case 'text-answer':
        return this.selectedAnswers[questionId].trim().toLowerCase() === question.answer.trim().toLowerCase();
      case 'canvas-task':
        if (!this.currentQuestion?.content) {
          return false;
        }
        return await this.canvasTaskComponent.challengeCheckCircuit(this.currentQuestion?.content);
      default:
        console.error('Unknown question type:', question.type);
        return false;
    }
  }
}
