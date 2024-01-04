import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, catchError, map, of, takeUntil } from "rxjs";
import { WPService } from "src/app/core/services/wp/wp.service";
import { Artist } from "src/app/models/artist";

@Component({
  selector: 'app-artist-list',
  templateUrl: './artist-list.component.html',
  styleUrls: ['./artist-list.component.css']
})
export class ArtistListComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  artists: Artist[] = [];

  loading: boolean = true;

  page: number = 1;
  perPage: number = 100;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private wpService: WPService, private router: Router, private activatedRoute: ActivatedRoute, private titleService: Title) { }

  ngOnInit() {
    this.getArtists(this.page, this.perPage);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getArtists(page: number, perPage: number) {
    this.wpService.getArtists(page, perPage).pipe(
      map(data => {
        const artists = data.artists.map(artist => new Artist(artist));
        this.artists = [...this.artists, ...artists];
        const totalPages = Number(data.headers.get('X-WP-TotalPages'));
        if (page >= totalPages) {
          this.hasMore = false;
        }
        return artists;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the artists list:', error);
        return of([]);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.loadingMore = false;
        this.titleService.setTitle('Artists - KOCMOC');
      },
      error: (error) => {
        console.error('Main observable error:', error);
        this.loading = false;
      }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.page += 1;
    this.getArtists(this.page, this.perPage);
  }

  activeRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}