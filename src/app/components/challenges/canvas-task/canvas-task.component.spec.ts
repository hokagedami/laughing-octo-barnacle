import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CanvasTaskComponent} from './canvas-task.component';
import {NgxToastAlertsService} from 'ngx-toast-alerts';
import {By} from '@angular/platform-browser';
import {SimulatorCanvasComponent} from '../../simulator/simulator-canvas/simulator-canvas.component';

describe('CanvasTaskComponent', () => {
  let component: CanvasTaskComponent;
  let fixture: ComponentFixture<CanvasTaskComponent>;
  let mockToastService: jasmine.SpyObj<NgxToastAlertsService>;
  let mockSimulatorCanvas: jasmine.SpyObj<SimulatorCanvasComponent>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('NgxToastAlertsService', ['success', 'error']);
    mockSimulatorCanvas = jasmine.createSpyObj('SimulatorCanvasComponent', ['challengeTakeCanvasSnapshot', 'challengeDisableCanvas', 'challengeCheckCircuit']);

    await TestBed.configureTestingModule({
      imports: [CanvasTaskComponent],
      providers: [
        {provide: NgxToastAlertsService, useValue: mockToastService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasTaskComponent);
    component = fixture.componentInstance;
    component.simulatorCanvas = mockSimulatorCanvas;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should display question content when question is provided', () => {
  //   component.question = {
  //     id: 1,
  //     level: 'medium',
  //     type: 'canvas-task',
  //     content: 'Draw a circle',
  //     answer: 'circle'
  //   };
  //   fixture.detectChanges();
  //   const questionElement = fixture.debugElement.query(By.css('h3'));
  //   expect(questionElement.nativeElement.textContent).toContain('Draw a circle');
  // });

  it('should submit answer and emit event when canvas has content', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'canvas-task',
      content: 'Draw a circle',
      answer: 'circle'
    };
    mockSimulatorCanvas.challengeTakeCanvasSnapshot.and.returnValue('base64-image-data');
    spyOn(component.answerProvided, 'emit');

    component.submitAnswer();

    expect(mockSimulatorCanvas.challengeTakeCanvasSnapshot).toHaveBeenCalled();
    expect(mockSimulatorCanvas.challengeDisableCanvas).toHaveBeenCalled();
    expect(component.answerProvided.emit).toHaveBeenCalledWith({
      questionId: 1,
      selectedOption: 'base64-image-data'
    });
    expect(component.showSubmitButton).toBeFalse();
    expect(component.showAnswer).toBeTrue();
    expect(component.canvasShot).toBe('base64-image-data');
  });

  it('should show error toast when submitting empty canvas', () => {
    mockSimulatorCanvas.challengeTakeCanvasSnapshot.and.returnValue(null);
    component.submitAnswer();
    expect(mockToastService.error).toHaveBeenCalledWith('Please draw something before submitting your answer!');
  });

  it('should call simulatorCanvas.challengeCheckCircuit when challengeCheckCircuit is called', async () => {
    mockSimulatorCanvas.challengeCheckCircuit.and.resolveTo(true);
    const result = await component.challengeCheckCircuit('test question');
    expect(mockSimulatorCanvas.challengeCheckCircuit).toHaveBeenCalledWith('test question');
    expect(result).toBeTrue();
  });

  it('should not display submit button when showSubmitButton is false', () => {
    component.showSubmitButton = false;
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button'));
    expect(submitButton).toBeFalsy();
  });

});
