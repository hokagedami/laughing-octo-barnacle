import { Component } from '@angular/core';
import {LessonContentComponent} from "../lesson-content/lesson-content.component";
import {SidebarComponent} from "../sidebar/sidebar.component";

@Component({
  selector: 'app-tutorial-home',
  standalone: true,
  imports: [
    LessonContentComponent,
    SidebarComponent
  ],
  templateUrl: './tutorial-home.component.html',
  styleUrl: './tutorial-home.component.css'
})
export class TutorialHomeComponent {
  selectedPage: any;

}
