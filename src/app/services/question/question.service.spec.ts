import { TestBed } from '@angular/core/testing';
import { QuestionService } from './question.service';
import { Question } from '../../models/question.model';

describe('QuestionService', () => {
  let service: QuestionService;
  let mockQuestions: Question[];

  beforeEach(() => {
    mockQuestions = [
      { id: 1, level: 'easy', type: 'canvas-task', content: 'Draw a circle', answer: 'circle.png' },
      { id: 2, level: 'easy', type: 'canvas-task', content: 'Draw a square', answer: 'square.png' },
      { id: 3, level: 'easy', type: 'multiple-choice', content: 'What color is the sky?', options: ['Blue', 'Green', 'Red'], answer: 'Blue' },
      { id: 4, level: 'medium', type: 'canvas-task', content: 'Draw a house', answer: 'house.png' },
      { id: 5, level: 'medium', type: 'canvas-task', content: 'Draw a tree', answer: 'tree.png' },
      { id: 6, level: 'hard', type: 'canvas-task', content: 'Draw a complex shape', answer: 'complex-shape.png' },
      { id: 7, level: 'hard', type: 'canvas-task', content: 'Draw a landscape', answer: 'landscape.png' },
      { id: 8, level: 'hard', type: 'text-answer', content: 'Explain the theory of relativity', answer: 'E = mc^2 ...' },
    ];

    const questionServiceMock = {
      loadQuestions: jasmine.createSpy('loadQuestions'),
      getQuestions: jasmine.createSpy('getQuestions').and.callFake((level: 'easy' | 'medium' | 'hard') => {
        return mockQuestions
          .filter(q => q.level === level && q.type === 'canvas-task')
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
      }),
      getQuestionById: jasmine.createSpy('getQuestionById').and.callFake((id: number) => {
        return mockQuestions.find(q => q.id === id);
      })
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: QuestionService, useValue: questionServiceMock }
      ]
    });

    service = TestBed.inject(QuestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuestions', () => {
    it('should return 2 easy canvas-task questions', () => {
      const questions = service.getQuestions('easy');
      expect(questions.length).toBe(2);
      expect(questions.every(q => q.level === 'easy' && q.type === 'canvas-task')).toBeTrue();
    });

    it('should return 2 medium canvas-task questions', () => {
      const questions = service.getQuestions('medium');
      expect(questions.length).toBe(2);
      expect(questions.every(q => q.level === 'medium' && q.type === 'canvas-task')).toBeTrue();
    });

    it('should return 2 hard canvas-task questions', () => {
      const questions = service.getQuestions('hard');
      expect(questions.length).toBe(2);
      expect(questions.every(q => q.level === 'hard' && q.type === 'canvas-task')).toBeTrue();
    });

    it('should call getQuestions with correct parameters', () => {
      service.getQuestions('easy');
      expect(service.getQuestions).toHaveBeenCalledWith('easy');
    });
  });

  describe('getQuestionById', () => {
    it('should return the correct question for a given id', () => {
      const question = service.getQuestionById(4);
      expect(question).toBeDefined();
      expect(question?.id).toBe(4);
      expect(question?.level).toBe('medium');
      expect(question?.type).toBe('canvas-task');
      expect(question?.content).toBe('Draw a house');
      expect(question?.answer).toBe('house.png');
    });

    it('should return undefined for a non-existent id', () => {
      const question = service.getQuestionById(100);
      expect(question).toBeUndefined();
    });

    it('should return a question with all required properties', () => {
      const question = service.getQuestionById(3);
      expect(question).toBeDefined();
      expect(question?.id).toBe(3);
      expect(question?.level).toBe('easy');
      expect(question?.type).toBe('multiple-choice');
      expect(question?.content).toBe('What color is the sky?');
      expect(question?.options).toEqual(['Blue', 'Green', 'Red']);
      expect(question?.answer).toBe('Blue');
    });

    it('should call getQuestionById with correct parameters', () => {
      service.getQuestionById(1);
      expect(service.getQuestionById).toHaveBeenCalledWith(1);
    });
  });
});
