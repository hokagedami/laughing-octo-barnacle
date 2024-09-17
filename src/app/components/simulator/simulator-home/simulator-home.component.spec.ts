import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimulatorHomeComponent } from './simulator-home.component';
import { SimulatorCanvasComponent } from '../simulator-canvas/simulator-canvas.component';
import { Connection } from '../../../models/connection.model';
import { By } from '@angular/platform-browser';

describe('SimulatorHomeComponent', () => {
  let component: SimulatorHomeComponent;
  let fixture: ComponentFixture<SimulatorHomeComponent>;
  let mockSimulatorCanvasComponent: jasmine.SpyObj<SimulatorCanvasComponent>;

  beforeEach(async () => {
    mockSimulatorCanvasComponent = jasmine.createSpyObj('SimulatorCanvasComponent', [
      'createAndSampleCircuit',
      'checkCircuit',
      'takeCanvasSnapshot'
    ]);

    await TestBed.configureTestingModule({
      imports: [SimulatorHomeComponent, SimulatorCanvasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorHomeComponent);
    component = fixture.componentInstance;
    component.simulatorCanvasComponent = mockSimulatorCanvasComponent;
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

  it('should have a guide section in the template', () => {
    const guideElement = fixture.debugElement.query(By.css('.sidebar'));
    expect(guideElement).toBeTruthy();
  });

  it('should have buttons for Check Circuit, Create Sample Circuit, and Take Snapshot', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const buttonTexts = buttons.map(button => button.nativeElement.textContent.trim());
    expect(buttonTexts).toContain('Check Circuit');
    expect(buttonTexts).toContain('Create Sample Circuit');
    expect(buttonTexts).toContain('Take Snapshot');
  });

  it('should disable Check Circuit button when checkCircuitBtnDisabled is true', () => {
    component.checkCircuitBtnDisabled = true;
    fixture.detectChanges();
    const checkCircuitButton = fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.trim() === 'Check Circuit');
    expect(checkCircuitButton?.nativeElement.disabled).toBeTrue();
  });

  it('should enable Check Circuit button when checkCircuitBtnDisabled is false', () => {
    component.checkCircuitBtnDisabled = false;
    fixture.detectChanges();
    const checkCircuitButton = fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.trim() === 'Check Circuit');
    expect(checkCircuitButton?.nativeElement.disabled).toBeFalse();
  });
});
