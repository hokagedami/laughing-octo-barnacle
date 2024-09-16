import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorCanvasComponent } from './simulator-canvas.component';
import { ClaudeService } from '../../../services/claude/claude.service';
import { NgxToastAlertsService } from 'ngx-toast-alerts';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';
import { Connection } from '../../../models/connection.model';
import Konva from 'konva';
import { provideRouter } from '@angular/router';

describe('SimulatorCanvasComponent', () => {
  let component: SimulatorCanvasComponent;
  let fixture: ComponentFixture<SimulatorCanvasComponent>;
  let mockClaudeService: jasmine.SpyObj<ClaudeService>;
  let mockToastService: jasmine.SpyObj<NgxToastAlertsService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockClaudeService = jasmine.createSpyObj('ClaudeService', ['verifyLogicGateCircuit']);
    mockToastService = jasmine.createSpyObj('NgxToastAlertsService', ['error', 'success']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ SimulatorCanvasComponent ],
      providers: [
        provideRouter([]),
        { provide: ClaudeService, useValue: mockClaudeService },
        { provide: NgxToastAlertsService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorCanvasComponent);
    component = fixture.componentInstance;

    // Mock ElementRef for stageContainer and toolbarContainer
    component.stageContainer = { nativeElement: document.createElement('div') } as ElementRef<HTMLDivElement>;
    component.toolbarContainer = { nativeElement: document.createElement('div') } as ElementRef<HTMLDivElement>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Make sure you have at least one test case here
  it('should initialize Konva stage and layers', () => {
    component.ngOnInit();
    expect(component.canvasStage).toBeTruthy();
    expect(component.canvasLayer).toBeTruthy();
    expect(component.toolbarStage).toBeTruthy();
    expect(component.toolbarLayer).toBeTruthy();
  });

  // Add more test cases as needed...
});
