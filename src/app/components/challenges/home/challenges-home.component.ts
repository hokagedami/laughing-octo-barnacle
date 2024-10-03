import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {User} from "../../../models/user.model";
import {Question} from "../../../models/question.model";
import {UserService} from "../../../services/user/user.service";
import {QuestionService} from "../../../services/question/question.service";
import {NgComponentOutlet, NgIf} from "@angular/common";
import {CurrentLevelComponent} from '../current-level/current-level.component';
import confetti from "canvas-confetti";

@Component({
  selector: 'app-challenges-home',
  standalone: true,
  imports: [
    NgComponentOutlet,
    NgIf,
    CurrentLevelComponent
  ],
  templateUrl: './challenges-home.component.html',
  styleUrl: './challenges-home.component.css'
})
export class ChallengesHomeComponent implements OnInit, OnDestroy {
  user: User | null = null;
  questions: Question[] = [];
  currentLevel: 'easy' | 'medium' | 'hard' = 'easy';
  @Input() levelUpdate: string = '';
  private isConfettiActive: boolean = false;
  private confettiInterval!: any;

  constructor(private userService: UserService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      if (this.user.challengeCompleted) {
        this.toggleConfetti();
      }
      else{
        this.loadQuestions();
      }
    }
  }

  ngOnDestroy(): void {
    confetti.reset();
    this.stopConfetti();
  }

  async loadQuestions(): Promise<void> {
    if (this.user) {
      this.questions = await this.questionService.getQuestions();
      this.currentLevel = this.user.level;
    }
  }

  handleLevelChange(newLevel: string): void {
    if (this.user) {
      if (newLevel === this.user.level) {
        this.loadQuestions()
          .then(r => {
            return;
          }).catch(error => {
          console.error('Error loading questions:', error);
        });
        return;
      }
      this.user.level = newLevel as 'easy' | 'medium' | 'hard';
      this.userService.updateProgress(this.user.level, 0);
      this.loadQuestions()
        .then(r => {})
        .catch(error => {});
    }
  }

  toggleConfetti() {
    if (this.isConfettiActive) {
      this.stopConfetti();
    } else {
      this.startContinuousConfetti();
    }
  }

  startContinuousConfetti() {
    if (this.isConfettiActive) return;

    this.isConfettiActive = true;
    this.confettiInterval = setInterval(() => {
      confetti({
        particleCount: 100,
        spread: 360,
        origin: { y: 0.6 }
      });
    }, 250);
  }

  stopConfetti() {
    if (this.confettiInterval) {
      clearInterval(this.confettiInterval);
      this.confettiInterval = null;
    }
    this.isConfettiActive = false;
  }

}
