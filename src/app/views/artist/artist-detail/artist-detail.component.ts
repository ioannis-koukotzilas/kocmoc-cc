import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, forkJoin, switchMap, takeUntil, tap } from "rxjs";
import { WPService } from "src/app/core/services/wp/wp.service";

import { Artist } from "src/app/models/artist";

@Component({
    selector: 'app-artist-detail',
    templateUrl: './artist-detail.component.html',
    styleUrls: ['./artist-detail.component.css']
})

export class ArtistDetailComponent implements OnInit {

    private unsubscribe$ = new Subject<void>();

    loading: boolean = true;

    artist: Artist | null = null;

    constructor(private route: ActivatedRoute, private wpService: WPService) { }

    ngOnInit(): void {
        this.getArtist();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


    getArtist(): void {
        this.route.paramMap.pipe(
          takeUntil(this.unsubscribe$),
          switchMap(params => {
            const id = Number(params.get('id') || '0');
            this.loading = true;
            return this.wpService.getArtist(id);
          }),
          tap(artist => this.artist = new Artist(artist)),
          switchMap(artist => forkJoin({
            episodes: this.wpService.getArtistEpisode([artist.id]),
          })),
          tap(({ episodes }) => {
            if (this.artist) {
              this.artist.episodes = episodes;
            }
          })
        ).subscribe({
          next: () => {
            this.loading = false;
            // const showIds = this.episode?.shows?.map(show => show.id);
            // if (showIds && showIds.length > 0) {
            //   this.getRelatedEpisodes(2, 1, showIds);
            // }
          },
          error: (error) => {
            console.error('An error occurred:', error);
          },
          complete: () => {
            console.log('Episode retrieval completed.');
          }
        });
      }
}