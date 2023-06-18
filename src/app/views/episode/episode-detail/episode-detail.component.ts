import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';
import { Show } from 'src/app/models/show';

@Component({
    selector: 'app-episode-detail',
    templateUrl: './episode-detail.component.html',
    styleUrls: ['./episode-detail.component.css']
})
export class EpisodeDetailComponent implements OnInit {

    episode: Episode | undefined;
    shows: Show[] = [];
    artists: Artist[] = [];
    genres: Genre[] = [];
    episodes: Episode[] = [];

    isLoadingEpisode: boolean = true;

    private unsubscribe$ = new Subject<void>();

    public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
    public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
    public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

    currentPage: number = 1;
    hasMoreEpisodes: boolean = true;
    isLoadingMoreEpisodes: boolean = false;

    constructor(private route: ActivatedRoute, private wordPressService: WordPressService, private audioPlayerService: AudioPlayerService, private location: Location) { }

    ngOnInit(): void {
        this.getEpisode();
        this.getRelatedEpisodes(4, 1);
    }

    getEpisode(): void {
        this.route.paramMap.pipe(
            takeUntil(this.unsubscribe$),
            switchMap(params => {
                const id = Number(params.get('id') || '0');
                return this.wordPressService.getEpisode(id);
            }),
            switchMap(apiData => {
                this.episode = new Episode(apiData);
                const requests = {
                    shows: this.episode?.show && this.episode.show.length > 0 ? this.wordPressService.getShowsByEpisodeIds([this.episode.id]) : of([]),
                    artists: this.episode?.artist && this.episode.artist.length > 0 ? this.wordPressService.getArtistsByEpisodeIds([this.episode.id]) : of([]),
                    genres: this.episode?.genre && this.episode.genre.length > 0 ? this.wordPressService.getGenresByEpisodeIds([this.episode.id]) : of([]),
                };
                return forkJoin(requests);
            }),
            catchError(error => {
                console.error('An error occurred:', error);
                return of({shows: [], artists: [], genres: []});
            })
        ).subscribe(({shows, artists, genres}) => {
            this.shows = shows;
            this.artists = artists;
            this.genres = genres;
            this.isLoadingEpisode = false;
        });
    }

    getEpisodeShow(showId: number): Show | null {
        return this.shows.find(x => x.id === showId) || null;
    }

    getEpisodeArtist(artistId: number): Artist | null {
        return this.artists.find(x => x.id === artistId) || null;
    }

    getEpisodeGenre(genreId: number): Genre | null {
        return this.genres.find(x => x.id === genreId) || null;
    }

    getRelatedEpisodes(perPage: number, page: number): void {
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
                    this.isLoadingMoreEpisodes = false;
                });
        }, 300);
    }

    getArtistEpisodes(artistId: number): Episode[] {
        return this.episodes.filter(episode => episode.artist.includes(artistId));
    }

    playEpisode(episode: Episode) {
        if (this.audioPlayerService.liveStreamPlaying.value) {
            this.audioPlayerService.stopLiveStream();
        }
        if (this.audioPlayerService.currentOnDemandStream.value?.id === episode.id) {
            this.audioPlayerService.toggleOnDemandStream(episode);
        } else {
            this.audioPlayerService.playOnDemandStream(episode);
        }
    }

    goBack(): void {
        this.location.back();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}