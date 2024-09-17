import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorCanvasComponent } from './simulator-canvas.component';
import { NgxToastAlertsService } from 'ngx-toast-alerts';
import { ClaudeService } from '../../../services/claude/claude.service';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';
import Konva from 'konva';
import {GateCircle} from "../../../models/konva/gate-circle.konva";

describe('SimulatorCanvasComponent', () => {
  let component: SimulatorCanvasComponent;
  let fixture: ComponentFixture<SimulatorCanvasComponent>;
  let mockToastService: jasmine.SpyObj<NgxToastAlertsService>;
  let mockClaudeService: jasmine.SpyObj<ClaudeService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('NgxToastAlertsService', ['success', 'error']);
    mockClaudeService = jasmine.createSpyObj('ClaudeService', ['verifyLogicGateCircuit', 'verifyLogicGateCircuitWithQuestion']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SimulatorCanvasComponent],
      providers: [
        { provide: NgxToastAlertsService, useValue: mockToastService },
        { provide: ClaudeService, useValue: mockClaudeService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorCanvasComponent);
    component = fixture.componentInstance;

    // Mock ElementRef for stageContainer and toolbarContainer
    component.stageContainer = {
      nativeElement: document.createElement('div')
    } as ElementRef<HTMLDivElement>;
    component.toolbarContainer = {
      nativeElement: document.createElement('div')
    } as ElementRef<HTMLDivElement>;

    // Mock Konva stages and layers
    component.canvasStage = new Konva.Stage({
      container: component.stageContainer.nativeElement,
      width: 850,
      height: 600
    });
    component.canvasLayer = new Konva.Layer();
    component.canvasStage.add(component.canvasLayer);

    component.toolbarStage = new Konva.Stage({
      container: component.toolbarContainer.nativeElement,
      width: 850,
      height: 100
    });
    component.toolbarLayer = new Konva.Layer();
    component.toolbarStage.add(component.toolbarLayer);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize Konva stage and layers', () => {
    component.ngOnInit();
    expect(component.canvasStage).toBeTruthy();
    expect(component.canvasLayer).toBeTruthy();
    expect(component.toolbarStage).toBeTruthy();
    expect(component.toolbarLayer).toBeTruthy();
  });

  it('should create toolbar items', () => {
    component.ngOnInit();
    const toolbarItems = component.toolbarLayer.getChildren();
    expect(toolbarItems.length).toBeGreaterThan(0);
  });

  it('should handle connector click', () => {
    const mockEvent = {
      target: new Konva.Rect()
    } as unknown as Konva.KonvaEventObject<MouseEvent>;
    component.handleConnectorClick(mockEvent);
    expect(component.selectedTool).toBe('connect');
  });

  it('should start a new connection', () => {
    const mockCircle = new GateCircle({ id: 'testCircle' });
    mockCircle.setAttr('circleType', 'output');
    const mockParent = new Konva.Group({ id: 'testParent' });
    mockParent.add(mockCircle);
    component['startNewConnection'](mockCircle, mockParent, 'output');
    expect(component.currentConnection).toBeTruthy();
    expect(component.isDrawingConnection).toBeTrue();
  });

  it('should complete a connection', () => {
    const startCircle = new GateCircle({ id: 'startCircle' });
    startCircle.setAttr('circleType', 'output');
    const endCircle = new GateCircle({ id: 'endCircle' });
    endCircle.setAttr('circleType', 'input');
    const startParent = new Konva.Group({ id: 'startParent' });
    const endParent = new Konva.Group({ id: 'endParent' });
    startParent.add(startCircle);
    endParent.add(endCircle);

    component['startNewConnection'](startCircle, startParent, 'output');
    component['completeConnection'](endCircle, endParent, 'input');

    expect(component.connections.length).toBe(1);
  });

  it('should create a sample circuit', () => {
    spyOn(component, 'drawConnectionLine');
    component.createAndSampleCircuit();
    expect(component.connections.length).toBeGreaterThan(0);
    expect(component.drawConnectionLine).toHaveBeenCalled();
  });

  it('should disable canvas for challenge', () => {
    const mockChild = new Konva.Group();
    spyOn(mockChild, 'draggable');
    spyOn(mockChild, 'off');
    component.canvasLayer.add(mockChild);

    component.challengeDisableCanvas();

    expect(mockChild.draggable).toHaveBeenCalledWith(false);
    expect(mockChild.off).toHaveBeenCalledTimes(5); // For each event type
    expect(component.toolbarLayer.visible()).toBeFalse();
  });
});
