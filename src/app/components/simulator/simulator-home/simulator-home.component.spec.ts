import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorHomeComponent } from './simulator-home.component';
import { SimulatorCanvasComponent } from '../simulator-canvas/simulator-canvas.component';
import { Connection } from '../../../models/connection.model';
import { By } from '@angular/platform-browser';
import { EventService } from '../../../services/event/event.service';
import { ClaudeService } from '../../../services/claude/claude.service';
import { of } from 'rxjs';

describe('SimulatorHomeComponent', () => {
  let component: SimulatorHomeComponent;
  let fixture: ComponentFixture<SimulatorHomeComponent>;
  let mockSimulatorCanvasComponent: jasmine.SpyObj<SimulatorCanvasComponent>;
  let mockEventService: jasmine.SpyObj<EventService>;
  let mockClaudeService: jasmine.SpyObj<ClaudeService>;

  beforeEach(async () => {
    mockSimulatorCanvasComponent = jasmine.createSpyObj('SimulatorCanvasComponent', [
      'createAndSampleCircuit',
      'checkCircuit',
      'takeCanvasSnapshot'
    ]);

    mockEventService = jasmine.createSpyObj('EventService', [], {
      resizeObservable$: of({ smallScreen: false })
    });

    mockClaudeService = jasmine.createSpyObj('ClaudeService', ['sendMessage']);

    await TestBed.configureTestingModule({
      imports: [SimulatorHomeComponent],
      providers: [
        { provide: EventService, useValue: mockEventService },
        { provide: ClaudeService, useValue: mockClaudeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorHomeComponent);
    component = fixture.componentInstance;
    component.simulatorCanvasComponent = mockSimulatorCanvasComponent;
    component.isOnSmallScreen = false; // Ensure we're not on a small screen for these tests
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update checkCircuitBtnDisabled when handleConnectionsChange is called', () => {
    const mockConnections: Connection[] = [{ } as Connection];
    component.handleConnectionsChange(mockConnections);
    expect(component.checkCircuitBtnDisabled).toBeFalse();

    component.handleConnectionsChange([]);
    expect(component.checkCircuitBtnDisabled).toBeTrue();
  });

  it('should update sampleCircuitBtnActive when handleSampleCircuitBtnActiveChange is called', () => {
    component.handleSampleCircuitBtnActiveChange(true);
    expect(component.sampleCircuitBtnActive).toBeTrue();

    component.handleSampleCircuitBtnActiveChange(false);
    expect(component.sampleCircuitBtnActive).toBeFalse();
  });

  it('should have buttons for Check Circuit, Create Sample Circuit, and Take Snapshot', () => {
    const buttonContainers = fixture.debugElement.queryAll(By.css('.d-flex.justify-content-evenly'));
    expect(buttonContainers.length).toBeGreaterThan(0);

    const buttonTexts = buttonContainers[0].children.map(child => child.nativeElement.textContent.trim());
    expect(buttonTexts).toContain('Check Circuit');
    expect(buttonTexts).toContain('Create Sample Circuit');
    expect(buttonTexts).toContain('Take Snapshot');
  });

  it('should disable Check Circuit button when checkCircuitBtnDisabled is true', () => {
    component.checkCircuitBtnDisabled = true;
    fixture.detectChanges();
    const checkCircuitButton = fixture.debugElement.queryAll(By.css('.d-flex.justify-content-evenly > *'))
      .find(el => el.nativeElement.textContent.trim() === 'Check Circuit');
    expect(checkCircuitButton?.nativeElement.disabled).toBeTrue();
  });

  it('should enable Check Circuit button when checkCircuitBtnDisabled is false', () => {
    component.checkCircuitBtnDisabled = false;
    fixture.detectChanges();
    const checkCircuitButton = fixture.debugElement.queryAll(By.css('.d-flex.justify-content-evenly > *'))
      .find(el => el.nativeElement.textContent.trim() === 'Check Circuit');
    expect(checkCircuitButton?.nativeElement.disabled).toBeFalse();
  });
});
