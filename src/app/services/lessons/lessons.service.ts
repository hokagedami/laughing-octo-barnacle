import { Injectable } from '@angular/core';
import { Lesson } from '../../models/lesson.model';
import lessons from '../../../../public/tutorialss.json';

@Injectable({
  providedIn: 'root'
})
export class LessonsService {
  private lessons: Lesson[] = [];

  constructor() {
    this.loadLessons();
  }

  private loadLessons() {
    this.lessons = lessons as Lesson[];
  }

  getLessons(): Lesson[] {
    this.loadLessons();
    return this.lessons;
  }

  getLesson(code: string): Lesson | undefined {
    this.loadLessons();
    return this.lessons.find(l => l.code === code);
  }

  getLessonsCodes() {
    this.loadLessons();
    return this.lessons.map(l => l.code);
  }
}
