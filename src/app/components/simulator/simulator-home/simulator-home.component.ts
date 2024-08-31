import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimulatorCanvasComponent} from "../simulator-canvas/simulator-canvas.component";
import {Connection} from "../../../models/connection.model";


@Component({
  selector: 'app-simulator-home',
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css'],
  standalone: true,
  imports: [CommonModule, SimulatorCanvasComponent]
})
export class SimulatorHomeComponent {
  @ViewChild(SimulatorCanvasComponent) simulatorCanvasComponent!: SimulatorCanvasComponent;
  checkCircuitBtnDisabled: boolean = true;
  constructor() {}


  createSampleCircuit() {
    this.simulatorCanvasComponent.createAndSampleCircuit();
  }

  checkCircuit() {
    this.simulatorCanvasComponent.checkCircuit();
  }

  handleConnectionsChange($event: Connection[]): void {
    this.checkCircuitBtnDisabled = $event.length === 0;
  }
}
