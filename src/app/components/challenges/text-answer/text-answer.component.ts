import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Question} from "../../../models/question.model";

@Component({
  selector: 'app-text-answer',
  standalone: true,
  imports: [],
  templateUrl: './text-answer.component.html',
  styleUrl: './text-answer.component.css'
})
export class TextAnswerComponent {
  @Input() question!: Question;
  @Output() answerSelected = new EventEmitter<{ questionId: number; selectedOption: string }>();

}
