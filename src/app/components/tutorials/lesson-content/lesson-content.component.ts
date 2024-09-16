import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {Lesson} from "../../../models/lesson.model";
import {LessonsService} from "../../../services/lessons/lessons.service";



@Component({
  selector: 'lesson-content',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgIf
  ],
  templateUrl: './lesson-content.component.html',
  styleUrl: './lesson-content.component.css'
})
export class LessonContentComponent implements OnInit, OnChanges {

  constructor(private lessonService: LessonsService) {
  }

  @Input() code: string = 'intro';
  lessons: Lesson[] = [];
  currentLesson!: Lesson;

  ngOnInit(): void {
    this.lessons = this.lessonService.getLessons();
    this.currentLesson = this.lessons[0];
    this.setLesson(this.code);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      this.setLesson(this.code);
    }
  }

  setLesson(code: string): void {
    const lesson = this.lessonService.getLesson(code);
    this.currentLesson = !lesson ? this.lessons[0] : lesson;
  }
}
