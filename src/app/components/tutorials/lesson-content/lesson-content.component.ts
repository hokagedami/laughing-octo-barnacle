import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {Lesson} from "../../../models/lesson.model";



@Component({
  selector: 'lesson-content',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './lesson-content.component.html',
  styleUrl: './lesson-content.component.css'
})
export class LessonContentComponent implements OnInit, OnChanges {

  @Input() page: string = 'intro';
  allLessons: Lesson[] = [
    {
      code: 'intro',
      title: 'Introduction',
      content: 'In this lesson, you will learn about the basics of logic gates and how they work.'
    },
    {
      code: 'basic',
      title: 'Basic Gates',
      content: 'In this lesson, you will learn about the basic logic gates and how they work.'
    },
    {
      code: 'adv',
      title: 'Advanced Gates',
      content: 'In this lesson, you will learn about the advanced logic gates and how they work.'
    }
  ];
  currentLesson: Lesson = this.allLessons[0];

  ngOnInit(): void {
    this.setLesson(this.page);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['page']) {
      this.setLesson(this.page);
    }
  }

  setLesson(page: string): void {
    const lesson = this.allLessons.find(lesson => lesson.code === page);
    this.currentLesson = !lesson ? this.allLessons[0] : lesson;
  }
}
