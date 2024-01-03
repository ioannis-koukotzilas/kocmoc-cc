import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    trigger('expandablePanelAnimation', [
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

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  @HostListener('document:click', ['$event'])
  public documentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (this.toggleSidebarBtn && this.toggleSidebarBtn.nativeElement && this.sidebar && this.sidebar.nativeElement) {
      if (!this.toggleSidebarBtn.nativeElement.contains(targetElement) && !this.sidebar.nativeElement.contains(targetElement)) {
        this.sidebarActive = false;
      }
    } 
  }

  closePanel() {
    this.sidebarActive = false;
  }

  navigateAfterClosePanel(route: any[]): void {
    this.closePanel();

    // setTimeout(() => {
    //   this.router.navigate(route);
    // }, 300);
  }

}
