import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimulatorCanvasComponent} from "../simulator-canvas/simulator-canvas.component";


@Component({
  selector: 'app-simulator-home',
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css'],
  standalone: true,
  imports: [CommonModule, SimulatorCanvasComponent]
})
export class SimulatorHomeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {  }
}
