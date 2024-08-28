import { Component, Input, OnInit } from '@angular/core';
import { Question } from '../../../models/question.model';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { TextAnswerComponent } from '../text-answer/text-answer.component';
import { CanvasTaskComponent } from '../canvas-task/canvas-task.component';
import { NgComponentOutlet, NgIf, TitleCasePipe } from '@angular/common';

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
  @Input() questions: Question[] = [];
  @Input() currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  currentQuestionIndex: number = 0;
  challengeStarted: boolean = false;
  hasProgress: boolean = false;
  currentQuestionType: string = '';

  private componentMapping: { [key: string]: any } = {
    'multiple-choice': MultipleChoiceComponent,
    'text-answer': TextAnswerComponent,
    'canvas-task': CanvasTaskComponent
  };
  currentQuestion!: Question | null;

  ngOnInit(): void {
    this.hasProgress = this.currentQuestionIndex > 0;
  }

  startChallenge(): void {
    this.challengeStarted = true;
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.currentQuestionType = this.currentQuestion.type;
  }

  getComponentForQuestionType(type: string): any {
    return this.componentMapping[type];
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionType = this.currentQuestion.type
    }
  }

  submitChallenge(): void {
    alert('Challenge submitted!');
  }

  handleAnswerSelected(event: { questionId: number, selectedOption: string }): void {
    const question = this.questions.find(q => q.id === event.questionId);
    if (question) {
      if (question.answer === event.selectedOption) {
        // Update user info for question passed
        console.log('Correct answer');
      } else {
        // Update user info for question failed
        console.log('Incorrect answer');
      }
    }
  }
}
