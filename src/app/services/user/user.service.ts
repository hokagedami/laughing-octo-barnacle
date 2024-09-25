import { Injectable } from '@angular/core';
import {User} from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { username: 'admin', level: 'hard', progress: { easy: 3, medium: 3, hard: 3 }, questionsAnswered: [], challengeCompleted: true }
  ];
  private currentUser: User | null = null;

  setUser(username: string): User {
    let user = this.users.find(u => u.username === username);
    if (!user) {
      user = { username, level: 'easy', progress: { easy: 0, medium: 0, hard: 0 }, questionsAnswered: [], challengeCompleted: false };
      this.users.push(user);
    }
    this.currentUser = user;
    return this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateProgress(level: 'easy' | 'medium' | 'hard', progress: number): void {
    if (this.currentUser) {
      this.currentUser.progress[level] = progress;
    }
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }


  updateUser(questionId: number, selectedOption: string, answerIsCorrect: boolean) {
    if (this.currentUser) {
      this.currentUser.questionsAnswered.push({ questionId, selectedOption, answerIsCorrect });
    }
  }

  updateChallengeCompleted(): void {
    if (this.currentUser) {
      this.currentUser.challengeCompleted = true;
    }
  }

  moveUserToNextLevel(): void {
    if (this.currentUser) {
      if (this.currentUser.level === 'easy') {
        this.currentUser.level = 'medium';
      } else if (this.currentUser.level === 'medium') {
        this.currentUser.level = 'hard';
      }
    }
  }
}
