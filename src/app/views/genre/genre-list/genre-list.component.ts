import { Component } from '@angular/core';
import { Observable, Subject, catchError, map, mergeMap, of, takeUntil } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Genre } from 'src/app/models/genre';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-genre-list',
  templateUrl: './genre-list.component.html',
  styleUrls: ['./genre-list.component.css']
})
export class GenreListComponent {

  private unsubscribe$ = new Subject<void>();

  genres: Genre[] = [];
  parentGenres: Genre[] = [];

  loading: boolean = true;

  page: number = 1;
  perPage: number = 100;

  hasMore: boolean = true;

  constructor(private wpService: WPService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.getGenres(this.page);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getGenres(page: number) {
    this.wpService.getGenres(page, this.perPage).pipe(
      map(data => {
        let genres = data.genres
          // .filter(genre => genre.count > 0)
          .map(genre => new Genre(genre));

        this.genres = [...this.genres, ...genres];

        const totalPages = Number(data.headers.get('X-WP-TotalPages'));
        if (page >= totalPages) {
          this.hasMore = false;
        }
        return genres;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the genres list:', error);
        return of([]);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (genres) => {
        this.structureGenres(genres);

        if (this.hasMore) {
          this.page += 1;
          this.getGenres(this.page);
        } else {
          this.loading = false;
        }

      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Get genres completed.');
      }
    });
  }

  structureGenres(genres: Genre[]) {
    this.parentGenres = genres.filter(g => g.parent === 0);

    this.parentGenres.forEach(parent => {
      parent.children = genres.filter(g => g.parent === parent.id);
    });
  }

  activeRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}