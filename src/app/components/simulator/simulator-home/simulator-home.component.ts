import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import Konva from 'konva';

interface Gate {
  id: number;
  x: number;
  y: number;
  type: string;
}

@Component({
  selector: 'app-simulator-home',
  standalone: true,
  imports: [  ],
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css']
})
export class SimulatorHomeComponent implements OnInit {

  @ViewChild('stageContainer', { static: true }) stageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('toolbar', { static: true }) toolbar!: ElementRef<HTMLDivElement>;

  stage!: Konva.Stage;
  layer!: Konva.Layer;

  constructor() {}

  ngOnInit(): void {
    this.initializeKonva();
    this.addDragAndDropFunctionality();
    this.createToolbar();
  }

  initializeKonva(): void {
    this.stage = new Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: 800,
      height: 600,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  createToolbar(): void {
    const andGate = this.createGate(0, 0, 'AND');
    const orGate = this.createGate(0, 0, 'OR');

    this.toolbar.nativeElement.appendChild(andGate);
    this.toolbar.nativeElement.appendChild(orGate);
  }

  createGate(x: number, y: number, type: string): HTMLDivElement {
    const gateDiv = document.createElement('div');
    gateDiv.style.position = 'relative';
    gateDiv.style.width = '100px';
    gateDiv.style.height = '50px';
    gateDiv.style.backgroundColor = 'lightgray';
    gateDiv.style.border = '2px solid black';
    gateDiv.style.borderRadius = '10px';
    gateDiv.style.display = 'flex';
    gateDiv.style.alignItems = 'center';
    gateDiv.style.justifyContent = 'center';
    gateDiv.style.cursor = 'pointer';
    gateDiv.innerText = type;

    gateDiv.draggable = true;
    gateDiv.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData('text/plain', type);
    });

    return gateDiv;
  }

  addDragAndDropFunctionality(): void {
    this.stageContainer.nativeElement.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    this.stageContainer.nativeElement.addEventListener('drop', (event) => {
      event.preventDefault();
      const type = event.dataTransfer?.getData('text/plain');
      if (type) {
        const x = event.clientX - this.stageContainer.nativeElement.getBoundingClientRect().left;
        const y = event.clientY - this.stageContainer.nativeElement.getBoundingClientRect().top;
        const gate = this.createGate(x, y, type);
        this.stageContainer.nativeElement.appendChild(gate);
      }
    });
  }
}
