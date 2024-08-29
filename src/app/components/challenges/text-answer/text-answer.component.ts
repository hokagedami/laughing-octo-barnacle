import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Question} from '../../../models/question.model';
import {NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-text-answer',
  templateUrl: './text-answer.component.html',
  standalone: true,
  imports: [
    NgIf,
    FormsModule
  ],
  styleUrls: ['./text-answer.component.css']
})
export class TextAnswerComponent {
  @Input() question: Question | null = null;
  @Output() answerSelected = new EventEmitter<{ questionId: number, selectedOption: string }>();
  userAnswer: string = '';
  showAnswer: boolean = false;

  submitAnswer(): void {
    if (this.question && this.userAnswer) {
      this.showAnswer = true;
      this.answerSelected.emit({questionId: this.question.id, selectedOption: this.userAnswer});
    }
  }
}
