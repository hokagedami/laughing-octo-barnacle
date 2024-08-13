import {Component, Input} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";

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
export class LessonContentComponent {
  @Input() page: string = 'intro';

  getCurrentPage() {
    switch (this.page) {
      case 'intro':
        return 'intro';
      case 'basic':
        return 'basic';
      case 'adv':
        return 'adv';
      default:
        return 'intro';
    }
  }

  getTitle() {
    switch (this.page) {
      case 'intro':
        return 'Introduction';
      case 'basic':
        return 'Basic Gates';
      case 'adv':
        return 'Advanced Gates';
      default:
        return 'Introduction';
    }
  }
}
