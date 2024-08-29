import {Component, EventEmitter, Output} from '@angular/core';
import {RouterLink} from "@angular/router";
import {LessonsService} from "../../../services/lessons/lessons.service";
import {Lesson} from "../../../models/lesson.model";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  lessons: Lesson[] = [];


  constructor(private lessonService: LessonsService) {
    this.lessons = this.lessonService.getLessons();
  }
  @Output() lessonCodeChange =  new EventEmitter<string>();
  navigate(code: string) {
    this.lessonCodeChange.emit(code);
  }
}
