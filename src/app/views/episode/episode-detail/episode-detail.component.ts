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
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    getEpisode(): void {
        this.route.paramMap.pipe(
            takeUntil(this.unsubscribe$),
            switchMap(params => {
                const id = Number(params.get('id') || '0');
                this.isLoadingEpisode = true;
                this.episodes = [];
                return this.wordPressService.getEpisode(id).pipe(
                    catchError(error => {
                        console.error('An error occurred:', error);
                        this.isLoadingEpisode = false;
                        return of(null);
                    })
                );
            }),
            switchMap(apiData => {
                if (!apiData) return of({ shows: [], artists: [], genres: [] });
                this.episode = new Episode(apiData);
                const requests = {
                    shows: this.episode?.show && this.episode.show.length > 0 ? this.wordPressService.getEpisodeShow([this.episode.id]) : of([]),
                    artists: this.episode?.artist && this.episode.artist.length > 0 ? this.wordPressService.getEpisodeArtist([this.episode.id]) : of([]),
                    genres: this.episode?.genre && this.episode.genre.length > 0 ? this.wordPressService.getEpisodeGenre([this.episode.id]) : of([]),
                };
                return forkJoin(requests).pipe(
                    catchError(error => {
                        console.error('An error occurred:', error);
                        return of({ shows: [], artists: [], genres: [] });
                    })
                );
            })
        ).subscribe(({ shows, artists, genres }) => {
            this.shows = shows;
            this.artists = artists;
            this.genres = genres;
            this.isLoadingEpisode = false;

            const showIds = shows.map(show => show.id);
            if (this.episode && showIds.length > 0) {
                this.getRelatedEpisodes(4, 1, showIds);
            }
        });
    }

    getEpisodeShow(showId: number): Show | null {
        return this.shows.find(x => x.id === showId) || null;
    }

    testEpisodeArtist(artistId: number): Artist | null {
        return this.artists.find(x => x.id === artistId) || null;
    }

    getEpisodeGenre(genreId: number): Genre | null {
        return this.genres.find(x => x.id === genreId) || null;
    }

    getRelatedEpisodes(perPage: number, page: number, showIds: number[]): void {
        this.wordPressService.getRelatedEpisodes(perPage, page, showIds).pipe(
            switchMap(apiData => {
                const allEpisodes = apiData.episodes.map(episode => new Episode(episode));
                // Filter out the current episode only from the episodes list
                const filteredEpisodes = allEpisodes.filter(episode => episode.id !== this.episode?.id);
                this.episodes = this.episodes.concat(filteredEpisodes);
                const totalPages = Number(apiData.headers.get('X-WP-TotalPages'));
                if (page >= totalPages) {
                    this.hasMoreEpisodes = false;
                }
                const episodeIds = allEpisodes.map(episode => episode.id);
                const getShows$ = this.wordPressService.getEpisodeShow(episodeIds);
                const getGenres$ = this.wordPressService.getEpisodeGenre(episodeIds);
                const getArtists$ = this.wordPressService.getEpisodeArtist(episodeIds);
                return forkJoin([getShows$, getGenres$, getArtists$]);
            }),
            catchError(error => {
                console.error('An error occurred:', error);
                return of(null);
            }),
            takeUntil(this.unsubscribe$)
        ).subscribe(result => {
            if (result) {
                const [shows, genres, artists] = result;
                this.shows = shows;
                this.genres = genres;
                this.artists = artists;
            }
            this.isLoadingMoreEpisodes = false;
        });
    }

    getShowEpisodes(showId: number): Episode[] {
        return this.episodes.filter(episode => episode.show.includes(showId));
    }

    getArtistEpisodes(artistId: number): Episode[] {
        return this.episodes.filter(episode => episode.artist.includes(artistId));
    }

    goBack(): void {
        this.location.back();
    }
}