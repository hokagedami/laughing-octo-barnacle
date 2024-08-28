import { Component, Input, OnInit } from '@angular/core';
import { Question } from '../../../models/question.model';
import { MultipleChoiceComponent } from '../multiple-choice/multiple-choice.component';
import { TextAnswerComponent } from '../text-answer/text-answer.component';
import { CanvasTaskComponent } from '../canvas-task/canvas-task.component';
import {NgComponentOutlet, NgIf, TitleCasePipe} from "@angular/common";

@Component({
  selector: 'app-current-level',
  templateUrl: './current-level.component.html',
  standalone: true,
  imports: [
    NgComponentOutlet,
    NgIf,
    TitleCasePipe
  ],
  styleUrls: ['./current-level.component.css']
})
export class CurrentLevelComponent implements OnInit {
  @Input() questions: Question[] = [];
  @Input() currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  currentQuestionIndex: number = 0;
  challengeStarted: boolean = false;
  hasProgress: boolean = false;

  private componentMapping: { [key: string]: any } = {
    'multiple-choice': MultipleChoiceComponent,
    'text-answer': TextAnswerComponent,
    'canvas-task': CanvasTaskComponent
  };

  ngOnInit(): void {
    this.hasProgress = this.currentQuestionIndex > 0;
  }

  startChallenge(): void {
    this.challengeStarted = true;
  }

  getComponentForQuestionType(type: string): any {
    return this.componentMapping[type];
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  submitChallenge(): void {
    alert('Challenge submitted!');
  }
}
