import { Injectable } from '@angular/core';
import {User} from "../../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { username: 'admin', level: 'easy', progress: { easy: 0, medium: 0, hard: 0 }, questionsAnswered: [], challengeCompleted: false }
  ];
  private currentUser: User | null = null;

  setUser(username: string): void {
    let user = this.users.find(u => u.username === username);
    if (!user) {
      user = { username, level: 'easy', progress: { easy: 0, medium: 0, hard: 0 }, questionsAnswered: [], challengeCompleted: false };
      this.users.push(user);
    }
    this.currentUser = user;
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
}
