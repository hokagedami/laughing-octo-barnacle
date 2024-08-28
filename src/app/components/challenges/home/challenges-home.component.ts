import {Component, OnInit} from '@angular/core';
import {User} from "../../../models/user.model";
import {Question} from "../../../models/question.model";
import {UserService} from "../../../services/user/user.service";
import {QuestionService} from "../../../services/question/question.service";
import {NgComponentOutlet, NgIf} from "@angular/common";
import {CurrentLevelComponent} from '../current-level/current-level.component';

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
export class ChallengesHomeComponent implements OnInit {
  user: User | null = null;
  questions: Question[] = [];
  currentLevel: 'easy' | 'medium' | 'hard' = 'easy';



  constructor(private userService: UserService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.loadQuestions();
    }
  }

  loadQuestions(): void {
    if (this.user) {
      this.questions = this.questionService.getQuestions(this.user.level, this.user.questionsAnswered);
    }
  }
}
