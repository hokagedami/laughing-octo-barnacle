import {Component, EventEmitter, Output} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  @Output() pageChange=  new EventEmitter<string>();
  navigate(page: string) {
    console.log(page);
    this.pageChange.emit(page);
  }
}
