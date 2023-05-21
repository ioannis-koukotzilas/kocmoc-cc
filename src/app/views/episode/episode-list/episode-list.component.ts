import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, switchMap, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/core/services/audio-player/audio-player.service';
import { CloudStorageService } from 'src/app/core/services/cloud-storage/cloud-storage.service';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Genre } from 'src/app/dtos/genre';

@Component({
    selector: 'app-episode-list',
    templateUrl: './episode-list.component.html',
    styleUrls: ['./episode-list.component.css']
})

export class EpisodeListComponent implements OnInit {
    episodes: any[] = [];
    genres: { [id: string]: Genre; } = {};
    audioPlaying = false;
    isLoading = true;

    // Track the currently playing episode.
    currentEpisode: any = null;

    constructor(
        private wordPressService: WordPressService,
        private cloudStorageService: CloudStorageService,
        public audioPlayerService: AudioPlayerService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;

        this.wordPressService.fetchEpisodes().pipe(
            tap(episodesData => {
                this.episodes = episodesData;
            }),
            switchMap(() => this.fetchGenresForEpisodes()),
            catchError(error => {
                console.error('There was an error: ', error);
                this.isLoading = false;
                throw error;
            })
        ).subscribe(genresData => {
            genresData.forEach(genre => {
                this.genres[genre.id] = genre;
            });
            this.isLoading = false;
        });
    }

    // Check if an episode has a thumbnail
    hasThumbnail(episode: any): boolean {
        return episode._embedded && episode._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium;
    }

    // Get the thumbnail URL of an episode
    getThumbnailUrl(episode: any): string {
        return episode._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;
    }

    // Fetch genres for all episodes
    private fetchGenresForEpisodes(): Observable<Genre[]> {
        const genreIds = new Set<string>();
        for (const episode of this.episodes) {
            for (const genreId of episode.genre) {
                genreIds.add(genreId);
            }
        }

        // Join the ids with commas to create a string like '1,2,3'
        const idsString = Array.from(genreIds).join(',');

        return this.wordPressService.fetchGenres(idsString);
    }

    // Get the genres for a specific episode
    getGenresForEpisode(episode: any): Genre[] {
        // Map each genre ID of the episode to its genre data
        return episode.genre.map((id: string) => this.genres[id]);
    }

    playEpisode(episode: any): void {
        if (this.currentEpisode !== episode) {
            const trackUrl = this.cloudStorageService.getTrackUrl(episode.acf.mp3);
            this.audioPlayerService.stop();
            this.audioPlayerService.setTrackUrl(trackUrl);
            this.audioPlayerService.play();
            this.currentEpisode = episode;
        } else {
            if (this.audioPlayerService.isPlaying()) {
                this.audioPlayerService.pause();
            } else {
                this.audioPlayerService.play();
            }
        }
    }

}
