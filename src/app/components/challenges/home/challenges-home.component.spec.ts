import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengesHomeComponent } from './challenges-home.component';
import { UserService } from '../../../services/user/user.service';
import { QuestionService } from '../../../services/question/question.service';
import { User } from '../../../models/user.model';
import { Question } from '../../../models/question.model';
import { By } from '@angular/platform-browser';
import { CurrentLevelComponent } from '../current-level/current-level.component';

describe('ChallengesHomeComponent', () => {
  let component: ChallengesHomeComponent;
  let fixture: ComponentFixture<ChallengesHomeComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let questionServiceSpy: jasmine.SpyObj<QuestionService>;

  const mockUser: User = {
    username: 'testUser',
    level: 'easy',
    progress: { easy: 0, medium: 0, hard: 0 },
    questionsAnswered: [],
    challengeCompleted: false
  };

  const mockQuestions: Question[] = [
    { id: 1, level: 'easy', type: 'multiple-choice', content: 'Test question 1', options: ['A', 'B', 'C'], answer: 'A' },
    { id: 2, level: 'easy', type: 'multiple-choice', content: 'Test question 2', options: ['X', 'Y', 'Z'], answer: 'Z' }
  ];

  beforeEach(async () => {
    const userSpy = jasmine.createSpyObj('UserService', ['getCurrentUser', 'updateProgress']);
    const questionSpy = jasmine.createSpyObj('QuestionService', ['getQuestions']);

    await TestBed.configureTestingModule({
      imports: [ChallengesHomeComponent, CurrentLevelComponent],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: QuestionService, useValue: questionSpy }
      ]
    }).compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    questionServiceSpy = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;

    userServiceSpy.getCurrentUser.and.returnValue(mockUser);
    questionServiceSpy.getQuestions.and.returnValue(mockQuestions);

    fixture = TestBed.createComponent(ChallengesHomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user and questions on init', () => {
    fixture.detectChanges();
    expect(userServiceSpy.getCurrentUser).toHaveBeenCalled();
    expect(component.user).toEqual(mockUser);
    expect(component.questions).toEqual(mockQuestions);
  });

  it('should handle level change', () => {
    fixture.detectChanges();
    component.handleLevelChange('medium');
    expect(userServiceSpy.updateProgress).toHaveBeenCalledWith('medium', 0);
    expect(questionServiceSpy.getQuestions).toHaveBeenCalledWith('medium');
    expect(component.currentLevel).toBe('medium');
  });

  it('should not show congratulations message when challenges are not completed', () => {
    fixture.detectChanges();
    const congratsMessage = fixture.debugElement.query(By.css('.congratulations-message'));
    expect(congratsMessage).toBeNull();
  });

  it('should have correct CSS classes', () => {
    fixture.detectChanges();
    const homeElement = fixture.debugElement.query(By.css('.challenge-home'));
    expect(homeElement).toBeTruthy();
  });

  it('should have a current-level component', () => {
    const currentLevelElement = fixture.debugElement.query(By.css('app-current-level'));
    expect(currentLevelElement).toBeTruthy();
  });

});
