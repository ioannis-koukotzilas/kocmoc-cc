import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, of, switchMap, takeUntil, tap } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Page } from 'src/app/models/page';

@Component({
  selector: 'app-page-detail',
  templateUrl: './page-detail.component.html',
  styleUrls: ['./page-detail.component.css'],
})
export class PageDetailComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();

  page: Page | null = null;

  loading: boolean = true;

  constructor(private route: ActivatedRoute, private wpService: WPService, private titleService: Title, private metaService: Meta) { }

  ngOnInit(): void {
    this.getPage();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getPage(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id') || '0');
          return this.wpService.getPage(id).pipe(
            catchError((error) => {
              console.error('Error getting page:', error);
              return of(null);
            })
          );
        }),
        tap((page) => {
          if (page) {
            this.page = new Page(page);
            this.titleService.setTitle(`${this.page.title} - KOCMOC`);
            this.metaService.updateTag({ name: 'description', content: this.page.content });
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Main observable error:', error);
          this.loading = false;
        },
      });
  }
}
