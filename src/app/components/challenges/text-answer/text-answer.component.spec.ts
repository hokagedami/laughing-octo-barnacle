import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TextAnswerComponent} from './text-answer.component';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

describe('TextAnswerComponent', () => {
  let component: TextAnswerComponent;
  let fixture: ComponentFixture<TextAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextAnswerComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextAnswerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display anything when question is null', () => {
    component.question = null;
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent.trim();
    expect(content).toBe('');
  });

  it('should display question content when question is provided', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    fixture.detectChanges();
    const questionElement = fixture.debugElement.query(By.css('h3'));
    expect(questionElement.nativeElement.textContent).toContain('What is the capital of France?');
  });

  it('should have an input field for user answer', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input'));
    expect(inputElement).toBeTruthy();
  });

  it('should update userAnswer when input changes', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    fixture.detectChanges();
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'London';
    inputElement.dispatchEvent(new Event('input'));
    expect(component.userAnswer).toBe('London');
  });

  it('should show submit button when userAnswer is provided', () => {
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    component.userAnswer = 'London';
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button'));
    expect(submitButton).toBeTruthy();
    expect(submitButton.nativeElement.textContent).toContain('Submit');
  });

  it('should call submitAnswer method when submit button is clicked', () => {
    spyOn(component, 'submitAnswer');
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    component.userAnswer = 'London';
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(By.css('button'));
    submitButton.nativeElement.click();
    expect(component.submitAnswer).toHaveBeenCalled();
  });

  it('should emit answerSelected event when submitAnswer is called', () => {
    spyOn(component.answerSelected, 'emit');
    component.question = {
      id: 1,
      level: 'medium',
      type: 'text-answer',
      content: 'What is the capital of France?',
      answer: 'Paris'
    };
    component.userAnswer = 'London';
    component.submitAnswer();
    expect(component.answerSelected.emit).toHaveBeenCalledWith({
      questionId: 1,
      selectedOption: 'London'
    });
  });
});
