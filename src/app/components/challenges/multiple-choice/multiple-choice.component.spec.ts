import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MultipleChoiceComponent} from './multiple-choice.component';
import {Question} from '../../../models/question.model';
import {By} from '@angular/platform-browser';

describe('MultipleChoiceComponent', () => {
  let component: MultipleChoiceComponent;
  let fixture: ComponentFixture<MultipleChoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MultipleChoiceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display question content when question is null', () => {
    component.question = null;
    fixture.detectChanges();
    const questionElement = fixture.debugElement.query(By.css('h3'));
    expect(questionElement).toBeNull();
  });

  it('should display question content when question is provided', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'multiple-choice',
      content: 'Test Question',
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A'
    };
    fixture.detectChanges();
    const questionElement = fixture.debugElement.query(By.css('h3'));
    expect(questionElement.nativeElement.textContent).toContain('Test Question');
  });

  it('should emit answerSubmitted event when submitAnswer is called', () => {
    component.question = {
      id: 1,
      level: 'easy',
      type: 'multiple-choice',
      content: 'Test Question',
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A'
    };
    component.selectedOption = 'Option B';

    spyOn(component.answerSubmitted, 'emit');
    component.submitAnswer();

    expect(component.answerSubmitted.emit).toHaveBeenCalledWith({
      questionId: 1,
      selectedOption: 'Option B'
    });
  });

  it('should show answer after submitting', () => {
    component.question = {
      id: 1,
      level: 'hard',
      type: 'multiple-choice',
      content: 'Test Question',
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A'
    };
    component.selectedOption = 'Option B';
    component.submitAnswer();
    expect(component.showAnswer).toBe(true);
  });

  it('should reset selectedOption after submitting', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'multiple-choice',
      content: 'Test Question',
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A'
    };
    component.selectedOption = 'Option B';
    component.submitAnswer();
    expect(component.selectedOption).toBe('');
  });

  it('should not submit answer when no option is selected', () => {
    component.question = {
      id: 1,
      level: 'easy',
      type: 'multiple-choice',
      content: 'Test Question',
      options: ['Option A', 'Option B', 'Option C'],
      answer: 'Option A'
    };
    component.selectedOption = null;
    spyOn(component.answerSubmitted, 'emit');
    component.submitAnswer();
    expect(component.answerSubmitted.emit).not.toHaveBeenCalled();
  });

  it('should handle questions without options', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'Test Question',
      answer: 'Some answer'
    };
    fixture.detectChanges();
    const optionElements = fixture.debugElement.queryAll(By.css('.btn'));
    expect(optionElements.length).toBe(0);
  });
});
