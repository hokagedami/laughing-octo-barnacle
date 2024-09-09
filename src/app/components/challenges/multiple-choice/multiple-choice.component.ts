import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { Question } from '../../../models/question.model';
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../../services/user/user.service";

@Component({
  selector: 'app-multiple-choice',
  templateUrl: './multiple-choice.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./multiple-choice.component.css']
})
export class MultipleChoiceComponent {

  @Input() question: Question | null = null;
  @Output() answerSubmitted = new EventEmitter<{ questionId: number, selectedOption: string }>();
  selectedOption: string | null = null;
  showAnswer: boolean = false;

  selectOption(option: string): void {
    if (this.question && option) {
      this.selectedOption = option;
    }
  }

  submitAnswer(): void {
    if (this.question && this.selectedOption) {
      this.showAnswer = true;
      this.answerSubmitted.emit({questionId: this.question.id, selectedOption: this.selectedOption});
      this.selectedOption = "";
    }
  }
}
