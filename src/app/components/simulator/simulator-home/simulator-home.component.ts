import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {SimulatorCanvasComponent} from "../simulator-canvas/simulator-canvas.component";
import {Connection} from "../../../models/connection.model";
import {EventService} from "../../../services/event/event.service";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-simulator-home',
  templateUrl: './simulator-home.component.html',
  styleUrls: ['./simulator-home.component.css'],
  standalone: true,
  imports: [CommonModule, SimulatorCanvasComponent]
})
export class SimulatorHomeComponent implements OnInit, OnDestroy {
  @ViewChild(SimulatorCanvasComponent) simulatorCanvasComponent!: SimulatorCanvasComponent;
  checkCircuitBtnDisabled: boolean = true;
  sampleCircuitBtnActive: boolean = false;
  isOnSmallScreen: boolean = false;
  private resizeSubscription!: Subscription;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.isOnSmallScreen = window.innerWidth <= 1099;
    this.resizeSubscription = this.eventService.resizeObservable$.subscribe(({ smallScreen }) => {
      this.isOnSmallScreen = smallScreen;
    });
  }

  createSampleCircuit() {
    this.simulatorCanvasComponent.createAndSampleCircuit();
  }

  checkCircuit() {
    this.simulatorCanvasComponent.checkCircuit();
  }

  handleConnectionsChange($event: Connection[]): void {
    this.checkCircuitBtnDisabled = $event.length === 0;
  }

  handleSampleCircuitBtnActiveChange($event: boolean): void {
    this.sampleCircuitBtnActive = $event;
  }

  takeSnapshot() {
    this.simulatorCanvasComponent.takeCanvasSnapshot();
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

}
