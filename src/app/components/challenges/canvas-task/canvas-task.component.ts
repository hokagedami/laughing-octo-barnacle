import {Component, EventEmitter, inject, Input, Output, ViewChild} from '@angular/core';
import {Question} from "../../../models/question.model";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {SimulatorCanvasComponent} from "../../simulator/simulator-canvas/simulator-canvas.component";
import {NgxToastAlertsService} from "ngx-toast-alerts";

@Component({
  selector: 'app-canvas-task',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    SimulatorCanvasComponent,
    NgStyle
  ],
  templateUrl: './canvas-task.component.html',
  styleUrl: './canvas-task.component.css'
})
export class CanvasTaskComponent {
  @ViewChild(SimulatorCanvasComponent) simulatorCanvas!: SimulatorCanvasComponent;
  @Input() question!: Question;
  @Output() answerProvided = new EventEmitter<{ questionId: number; selectedOption: string }>();
  answerIsCorrect: boolean | null = null;

  showSubmitButton = true;
  canvasShot: string  | null = null;
  showAnswer: boolean = false;
  private toast = inject(NgxToastAlertsService);

  submitAnswer() {
    const screenshot = this.simulatorCanvas.challengeTakeCanvasSnapshot();
    if (screenshot) {
      this.simulatorCanvas.challengeDisableCanvas();
      this.answerProvided.emit({ questionId: this.question.id, selectedOption: screenshot });
      this.showSubmitButton = false;
      this.showAnswer = true;
      this.canvasShot = screenshot;

    } else {
      this.toast.error('Please draw something before submitting your answer!');
    }
  }

  async challengeCheckCircuit(question: string): Promise<boolean> {
    return await this.simulatorCanvas.challengeCheckCircuit(question);
  }
}
