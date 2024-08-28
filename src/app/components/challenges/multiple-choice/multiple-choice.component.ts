import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { Question } from '../../../models/question.model';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-multiple-choice',
  templateUrl: './multiple-choice.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./multiple-choice.component.css']
})
export class MultipleChoiceComponent implements OnInit {
  @Input() question: Question | null = null;
  @Output() answerSelected = new EventEmitter<{ questionId: number, selectedOption: string }>();
  selectedOption: string | null = null;

  ngOnInit() {
    console.log(this.question);
  }

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  submitAnswer(): void {
    if (this.question && this.selectedOption) {
      this.answerSelected.emit({ questionId: this.question.id, selectedOption: this.selectedOption });
    }
  }
}
