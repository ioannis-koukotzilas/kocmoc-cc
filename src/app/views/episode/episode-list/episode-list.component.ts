import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';

@Component({
    selector: 'app-episode-list',
    templateUrl: './episode-list.component.html',
    styleUrls: ['./episode-list.component.css'],
})
export class EpisodeListComponent implements OnInit {

    episodes: Episode[] = [];
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
        this.getEpisodes(3, 1);
    }

    getEpisodes(perPage: number, page: number): void {
        setTimeout(() => {
            this.wordPressService.getQueriedEpisodes(perPage, page)
                .pipe(
                    switchMap(apiData => {
                        const episodes = apiData.episodes.map(episode => new Episode(episode));
                        this.episodes = this.episodes.concat(episodes);
                        const totalPages = Number(apiData.headers.get('X-WP-TotalPages'));
                        if (page >= totalPages) {
                            this.hasMoreEpisodes = false;
                        }
                        const episodeIds = episodes.map(episode => episode.id);
                        const getGenres$ = this.wordPressService.getGenresByEpisodeIds(episodeIds);
                        const getArtists$ = this.wordPressService.getArtistsByEpisodeIds(episodeIds);
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

    getEpisodeArtist(artistId: number): Artist | null {
        return this.artists.find(artist => artist.id === artistId) || null;
    }

    getEpisodeGenre(genreId: number): Genre | null {
        return this.genres.find(genre => genre.id === genreId) || null;
    }

    loadMoreEpisodes(): void {
        this.isLoadingMoreEpisodes = true;
        this.currentPage += 1;
        this.getEpisodes(3, this.currentPage);
    }

    playEpisode(episode: Episode) {
        // If the live stream is playing, stop it
        if (this.audioPlayerService.liveStreamPlaying.value) {
            this.audioPlayerService.stopLiveStream();
        }
        // Toggle or play the on-demand stream
        if (this.audioPlayerService.currentOnDemandStream.value?.id === episode.id) {
            this.audioPlayerService.toggleOnDemandStream(episode);
        } else {
            this.audioPlayerService.playOnDemandStream(episode);
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}