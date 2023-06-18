import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';
import { Show } from 'src/app/models/show';

@Component({
    selector: 'app-episode-list',
    templateUrl: './episode-list.component.html',
    styleUrls: ['./episode-list.component.css'],
})
export class EpisodeListComponent implements OnInit {

    episodes: Episode[] = [];
    shows: Show[] = [];
    artists: Artist[] = [];
    genres: Genre[] = [];

    isLoadingEpisodes: boolean = true;

    currentPage: number = 1;
    hasMoreEpisodes: boolean = true;
    isLoadingMoreEpisodes: boolean = false;

    private unsubscribe$ = new Subject<void>();

    public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
    public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
    public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

    constructor(private wordPressService: WordPressService, public audioPlayerService: AudioPlayerService) { }

    ngOnInit(): void {
        this.getQueriedEpisodes(10, 1);
    }

    getQueriedEpisodes(perPage: number, page: number): void {
        setTimeout(() => {
            this.wordPressService.getEpisodes(perPage, page)
                .pipe(
                    switchMap(apiData => {
                        const episodes = apiData.episodes.map(episode => new Episode(episode));
                        this.episodes = this.episodes.concat(episodes);
                        const totalPages = Number(apiData.headers.get('X-WP-TotalPages'));
                        if (page >= totalPages) {
                            this.hasMoreEpisodes = false;
                        }
                        const episodeIds = episodes.map(episode => episode.id);
                        const getGenres$ = this.wordPressService.getEpisodeGenre(episodeIds);
                        const getArtists$ = this.wordPressService.getEpisodeArtist(episodeIds);
                        return forkJoin([getGenres$, getArtists$]);
                    }),
                    catchError(error => {
                        console.error('An error occurred:', error);
                        return of(null);
                    }),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe(result => {
                    if (result) {
                        const [genres, artists] = result;
                        this.genres = genres;
                        this.artists = artists;
                    }
                    this.isLoadingEpisodes = false;
                    this.isLoadingMoreEpisodes = false;
                });
        }, 300);
    }

    findEpisodeShow(showId: number): Show | null {
        return this.shows.find(x => x.id === showId) || null;
    }

    findEpisodeGenre(genreId: number): Genre | null {
        return this.genres.find(x => x.id === genreId) || null;
    }

    findEpisodeArtist(artistId: number): Artist | null {
        return this.artists.find(x => x.id === artistId) || null;
    }

    loadMoreEpisodes(): void {
        this.isLoadingMoreEpisodes = true;
        this.currentPage += 1;
        this.getQueriedEpisodes(10, this.currentPage);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}