import {
  Component,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  isMobileSidebarOpen = false;

openMobileSidebar(): void {
  this.isMobileSidebarOpen = true;
}

closeMobileSidebar(): void {
  this.isMobileSidebarOpen = false;
}

@HostListener('document:keydown.escape')
handleEscapeKey(): void {
  this.closeMobileSidebar();
}
}