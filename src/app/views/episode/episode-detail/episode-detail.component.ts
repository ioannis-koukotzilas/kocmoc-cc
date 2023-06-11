import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';

@Component({
    selector: 'app-episode-detail',
    templateUrl: './episode-detail.component.html',
    styleUrls: ['./episode-detail.component.css']
})
export class EpisodeDetailComponent implements OnInit {

    episode: Episode | undefined;
    artists: Artist[] = [];
    genres: Genre[] = [];
    episodes: Episode[] = [];
    isLoading: boolean = true;
    private unsubscribe$ = new Subject<void>();

    public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
    public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
    public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

    constructor(private route: ActivatedRoute, private wordPressService: WordPressService, private audioPlayerService: AudioPlayerService, private location: Location) { }

    ngOnInit(): void {
        this.getEpisode();
        this.getArtists();
        this.getGenres();
        this.getEpisodes();
    }

    getEpisode(): void {
        this.route.paramMap.pipe(
            takeUntil(this.unsubscribe$),
            switchMap(params => {
                const id = Number(params.get('id') || '0');
                return this.wordPressService.getEpisode(id);
            })
        ).subscribe(episode => {
            this.episode = episode;
            this.isLoading = false;
        });
    }

    getArtists(): void {
        this.wordPressService.getArtists()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(artists => this.artists = artists);
    }

    getGenres(): void {
        this.wordPressService.getGenres()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(genres => this.genres = genres);
    }

    getEpisodes(): void {
        this.wordPressService.getEpisodes()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(episodes => this.episodes = episodes);
    }

    getEpisodeArtist(artistId: number): Artist | null {
        return this.artists.find(artist => artist.id === artistId) || null;
    }

    getEpisodeGenre(genreId: number): Genre | null {
        return this.genres.find(genre => genre.id === genreId) || null;
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