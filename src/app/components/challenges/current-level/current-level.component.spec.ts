import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CurrentLevelComponent} from './current-level.component';
import {UserService} from '../../../services/user/user.service';
import {QuestionService} from '../../../services/question/question.service';
import {MultipleChoiceComponent} from '../multiple-choice/multiple-choice.component';
import {TextAnswerComponent} from '../text-answer/text-answer.component';
import {CanvasTaskComponent} from '../canvas-task/canvas-task.component';
import {NgComponentOutlet, NgIf, TitleCasePipe} from '@angular/common';
import {Question} from "../../../models/question.model";


describe('CurrentLevelComponent', () => {
  let component: CurrentLevelComponent;
  let fixture: ComponentFixture<CurrentLevelComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let questionServiceSpy: jasmine.SpyObj<QuestionService>;

  beforeEach(async () => {
    const userServiceSpyObj = jasmine.createSpyObj('UserService', ['updateProgress', 'updateUser']);
    const questionServiceSpyObj = jasmine.createSpyObj('QuestionService', ['getQuestionById']);

    await TestBed.configureTestingModule({
      imports: [
        CurrentLevelComponent,
        NgComponentOutlet,
        NgIf,
        TitleCasePipe,
        MultipleChoiceComponent,
        TextAnswerComponent,
        CanvasTaskComponent
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpyObj },
        { provide: QuestionService, useValue: questionServiceSpyObj }
      ]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    questionServiceSpy = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;

    fixture = TestBed.createComponent(CurrentLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentQuestionIndex).toBe(0);
    expect(component.challengeStarted).toBeFalse();
    expect(component.hasProgress).toBeFalse();
    expect(component.levelCompleted).toBeFalse();
    expect(component.nextQuestionDisabled).toBeTrue();
    expect(component.correctTotal).toBe(0);
    expect(component.challengeCompleted).toBeFalse();
    expect(component.showResult).toBeFalse();
    expect(component.NextButtonText).toBe('Next');
  });

  it('should start challenge when startChallenge is called', () => {
    const mockQuestions: Question[] = [
      { id: 1, level: 'easy', type: 'multiple-choice', content: 'Test?', options: ['A', 'B'], answer: 'A' }
    ];
    component.currentLevelQuestions = mockQuestions;
    component.startChallenge();
    expect(component.challengeStarted).toBeTrue();
    expect(component.currentQuestion).toEqual(mockQuestions[0]);
    expect(component.currentQuestionType).toBe('multiple-choice');
  });

  it('should handle multiple-choice answer selection correctly', () => {
    const mockQuestion: Question = { id: 1, level: 'easy', type: 'multiple-choice', content: 'Test?', options: ['A', 'B'], answer: 'A' };
    questionServiceSpy.getQuestionById.and.returnValue(mockQuestion);
    component.handleAnswerSelected({ questionId: 1, selectedOption: 'A' });
    expect(component.selectedAnswers[1]).toBe('A');
    expect(component.correctTotal).toBe(1);
    expect(userServiceSpy.updateProgress).toHaveBeenCalledWith(component.userCurrentLevel, 1);
    expect(userServiceSpy.updateUser).toHaveBeenCalledWith(1, 'A', true);
    expect(component.nextQuestionDisabled).toBeFalse();
  });

  it('should handle text-answer selection correctly', () => {
    const mockQuestion: Question = { id: 2, level: 'easy', type: 'text-answer', content: 'Test?', answer: 'Correct' };
    questionServiceSpy.getQuestionById.and.returnValue(mockQuestion);
    component.handleAnswerSelected({ questionId: 2, selectedOption: 'Correct' });
    expect(component.selectedAnswers[2]).toBe('Correct');
    expect(component.correctTotal).toBe(1);
    expect(userServiceSpy.updateProgress).toHaveBeenCalledWith(component.userCurrentLevel, 1);
    expect(userServiceSpy.updateUser).toHaveBeenCalledWith(2, 'Correct', true);
    expect(component.nextQuestionDisabled).toBeFalse();
  });

  it('should handle canvas-task answer selection', () => {
    const mockQuestion: Question = { id: 3, level: 'medium', type: 'canvas-task', content: 'Draw a circle', answer: 'circle' };
    questionServiceSpy.getQuestionById.and.returnValue(mockQuestion);
    component.handleAnswerSelected({ questionId: 3, selectedOption: 'circle' });
    expect(component.selectedAnswers[3]).toBe('circle');
    expect(component.correctTotal).toBe(1);
    expect(userServiceSpy.updateProgress).toHaveBeenCalledWith(component.userCurrentLevel, 1);
    expect(userServiceSpy.updateUser).toHaveBeenCalledWith(3, 'circle', true);
    expect(component.nextQuestionDisabled).toBeFalse();
  });

  it('should end challenge when all levels are completed', () => {
    component.userCurrentLevel = 'hard';
    component.goToNextLevel();
    expect(component.levelCompleted).toBeTrue();
  });

  it('should toggle confetti', () => {
    const startConfettiSpy = spyOn<any>(component, 'startContinuousConfetti');
    const stopConfettiSpy = spyOn<any>(component, 'stopConfetti');

    component.toggleConfetti();
    expect(startConfettiSpy).toHaveBeenCalled();

    component.isConfettiActive = true;
    component.toggleConfetti();
    expect(stopConfettiSpy).toHaveBeenCalled();
  });

  it('should move to previous question', () => {
    const mockQuestions: Question[] = [
      { id: 1, level: 'easy', type: 'multiple-choice', content: 'Test 1?', options: ['A', 'B'], answer: 'A' },
      { id: 2, level: 'easy', type: 'text-answer', content: 'Test 2?', answer: 'Answer' }
    ];
    component.currentLevelQuestions = mockQuestions;
    component.currentQuestionIndex = 1;
    component.previousQuestion();
    expect(component.currentQuestionIndex).toBe(0);
    expect(component.currentQuestion).toEqual(mockQuestions[0]);
    expect(component.currentQuestionType).toBe('multiple-choice');
    expect(component.NextButtonText).toBe('Next');
    expect(component.nextQuestionDisabled).toBeFalse();
  });

  it('should handle end of challenge correctly', () => {
    component.currentLevelQuestions = [
      {id: 1, level: 'easy', type: 'multiple-choice', content: 'Test 1?', options: ['A', 'B'], answer: 'A'},
      {id: 2, level: 'easy', type: 'text-answer', content: 'Test 2?', answer: 'Answer'}
    ];
    component.currentQuestionIndex = 1;
    component.nextQuestion();
    expect(component.showResult).toBeTrue();
    expect(component.levelCompleted).toBeTrue();
  });

  it('should complete challenge when all questions are answered correctly in hard level', () => {
    component.userCurrentLevel = 'hard';
    component.currentLevelQuestions = [
      { id: 1, level: 'hard', type: 'multiple-choice', content: 'Test 1?', options: ['A', 'B'], answer: 'A' },
      { id: 2, level: 'hard', type: 'text-answer', content: 'Test 2?', answer: 'Answer' }
    ];
    component.correctTotal = 2;
    component.currentQuestionIndex = 1;
    component.nextQuestion();
    expect(component.challengeCompleted).toBeTrue();
    expect(component.levelCompleted).toBeTrue();
  });
});
