import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Question} from "../../../models/question.model";

@Component({
  selector: 'app-canvas-task',
  standalone: true,
  imports: [],
  templateUrl: './canvas-task.component.html',
  styleUrl: './canvas-task.component.css'
})
export class CanvasTaskComponent {
  @Input() question!: Question;
  @Output() answerSelected = new EventEmitter<{ questionId: number; selectedOption: string }>();

}
