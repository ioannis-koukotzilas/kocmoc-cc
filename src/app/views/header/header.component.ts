import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('sidebarAnimation', [
      state(
        'expanded',
        style({
          transform: 'translateY(0)',
        })
      ),
      state(
        'collapsed',
        style({
          transform: 'translateY(-100%)',
        })
      ),
      transition('void => expanded', [
        style({
          transform: 'translateY(-100%)',
        }),
        animate('300ms ease-in-out'),
      ]),
      transition('expanded => void', [
        animate(
          '300ms ease-in-out',
          style({
            transform: 'translateY(-100%)',
          })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  public sidebarActive: boolean = false;

  @ViewChild('toggleSidebarBtn') toggleSidebarBtn: ElementRef = {} as ElementRef;
  @ViewChild('sidebar') sidebar: ElementRef = {} as ElementRef;

  constructor(private router: Router) { }

  toggleSidebar(): void {
    this.sidebarActive = !this.sidebarActive;
  }

  @HostListener('document:click', ['$event'])
  public documentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    if (this.toggleSidebarBtn && this.toggleSidebarBtn.nativeElement && this.sidebar && this.sidebar.nativeElement) {
      if (!this.toggleSidebarBtn.nativeElement.contains(targetElement) && !this.sidebar.nativeElement.contains(targetElement)) {
        this.sidebarActive = false;
      }
    }
  }

  closeSidebar(): void {
    this.sidebarActive = false;
  }

  navigateAfterCloseSidebar(route: any[]): void {
    this.closeSidebar();

    setTimeout(() => {
      this.router.navigate(route);
    }, 300);
  }
}