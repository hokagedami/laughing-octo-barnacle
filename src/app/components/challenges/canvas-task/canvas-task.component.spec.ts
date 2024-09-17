import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTaskComponent } from './canvas-task.component';
import { Question } from '../../../models/question.model';
import { NgxToastAlertsService } from 'ngx-toast-alerts';
import { By } from '@angular/platform-browser';
import { SimulatorCanvasComponent } from '../../simulator/simulator-canvas/simulator-canvas.component';

describe('CanvasTaskComponent', () => {
  let component: CanvasTaskComponent;
  let fixture: ComponentFixture<CanvasTaskComponent>;
  let mockToastService: jasmine.SpyObj<NgxToastAlertsService>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('NgxToastAlertsService', ['success']);

    await TestBed.configureTestingModule({
      imports: [CanvasTaskComponent],
      providers: [
        { provide: NgxToastAlertsService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasTaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display question content when question is provided', () => {
    const testQuestion: Question = {
      id: 1,
      level: 'medium',
      type: 'canvas-task',
      content: 'Draw a circle',
      answer: 'circle'
    };
    component.question = testQuestion;
    fixture.detectChanges();
    const questionElement = fixture.debugElement.query(By.css('h3'));
    expect(questionElement.nativeElement.textContent).toContain('Draw a circle');
  });

  it('should have a submit button', () => {
    const submitButton = fixture.debugElement.query(By.css('button'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.textContent).toContain('Submit');
  });

  it('should call submitAnswer method when submit button is clicked', () => {
    spyOn(component, 'submitAnswer');
    const submitButton = fixture.debugElement.query(By.css('button'));
    submitButton.nativeElement.click();
    expect(component.submitAnswer).toHaveBeenCalled();
  });

  it('should show success toast when submitAnswer is called', () => {
    component.submitAnswer();
    expect(mockToastService.success).toHaveBeenCalledWith('Answer submitted');
  });

  it('should include SimulatorCanvasComponent', () => {
    const canvasComponent = fixture.debugElement.query(By.directive(SimulatorCanvasComponent));
    expect(canvasComponent).toBeTruthy();
  });

  it('should not display anything when question is not provided', () => {
    component.question = undefined as any;
    fixture.detectChanges();
    const content = fixture.debugElement.nativeElement.textContent.trim();
    expect(content).toBe('');
  });
});
