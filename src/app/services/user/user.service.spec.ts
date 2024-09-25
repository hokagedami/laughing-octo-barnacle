import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../../models/user.model';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUser', () => {
    // it('should set an existing user as current user', () => {
    //   const user = service.setUser('admin');
    //   expect(user).toEqual({
    //     username: 'admin',
    //     level: 'hard',
    //     progress: { easy: 3, medium: 3, hard: 0 },
    //     questionsAnswered: [],
    //     challengeCompleted: false
    //   });
    //   expect(service.getCurrentUser()).toEqual(user);
    // });

    it('should create and set a new user if it doesn\'t exist', () => {
      const user = service.setUser('newuser');
      expect(user).toEqual({
        username: 'newuser',
        level: 'easy',
        progress: { easy: 0, medium: 0, hard: 0 },
        questionsAnswered: [],
        challengeCompleted: false
      });
      expect(service.getCurrentUser()).toEqual(user);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null if no user is set', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return the current user after setting one', () => {
      service.setUser('admin');
      const currentUser = service.getCurrentUser();
      expect(currentUser?.username).toBe('admin');
    });
  });

  describe('updateProgress', () => {
    it('should update the progress of the current user', () => {
      service.setUser('admin');
      service.updateProgress('medium', 5);
      const user = service.getCurrentUser();
      expect(user?.progress.medium).toBe(5);
    });

    it('should not update progress if no user is set', () => {
      service.updateProgress('easy', 2);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    it('should return the correct user for an existing username', () => {
      const user = service.getUserByUsername('admin');
      expect(user?.username).toBe('admin');
    });

    it('should return undefined for a non-existent username', () => {
      const user = service.getUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });
  });

  describe('updateUser', () => {
    it('should add a question to the current user\'s answered questions', () => {
      service.setUser('admin');
      service.updateUser(1, 'option1', true);
      const user = service.getCurrentUser();
      expect(user?.questionsAnswered).toEqual([
        { questionId: 1, selectedOption: 'option1', answerIsCorrect: true }
      ]);
    });

    it('should not update if no user is set', () => {
      service.updateUser(1, 'option1', true);
      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
