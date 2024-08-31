import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {Question} from "../../../models/question.model";
import {NgForOf, NgIf} from "@angular/common";
import {SimulatorCanvasComponent} from "../../simulator/simulator-canvas/simulator-canvas.component";
import {NgxToastAlertsService} from "ngx-toast-alerts";

@Component({
  selector: 'app-canvas-task',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    SimulatorCanvasComponent
  ],
  templateUrl: './canvas-task.component.html',
  styleUrl: './canvas-task.component.css'
})
export class CanvasTaskComponent {
  @Input() question!: Question;
  @Output() answerSelected = new EventEmitter<{ questionId: number; selectedOption: string }>();

  private toast = inject(NgxToastAlertsService);

  submitAnswer() {
    this.toast.success('Answer submitted');
  }
}
