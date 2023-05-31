import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AudioPlayerService {
    private audio: HTMLAudioElement = new Audio();
    private liveStreamUrl = 'https://kocmoc1-gecko.radioca.st/stream';

    private currentSource = new BehaviorSubject<string>('');
    currentSource$ = this.currentSource.asObservable();

    isPlaying: boolean = false;
    isPlayingLiveStream: boolean = false;
    isPlayingEpisode: boolean = false;

    setTrackUrl(url: string): void {
        this.audio.src = url;
        this.isPlayingLiveStream = false;
        this.currentSource.next(url);
    }

    setLiveStream(): void {
        this.audio.src = this.liveStreamUrl;
        this.isPlayingLiveStream = true;
        this.isPlayingEpisode = false;
        this.currentSource.next(this.liveStreamUrl);
    }

    play(): void {
        this.audio.play();
        this.isPlaying = true;
    }

    pause(): void {
        this.audio.pause();
        this.isPlaying = false;
    }

    playEpisode(): void {
        if (!this.isPlayingLiveStream) {
            this.play();
            this.isPlayingEpisode = true;
        }
    }

    pauseEpisode(): void {
        if (!this.isPlayingLiveStream) {
            this.pause();
            this.isPlayingEpisode = false;
        }
    }

    stop(): void {
        this.audio.pause();
        this.audio.currentTime = 0; // Resets the audio track to the beginning
        this.isPlaying = false;
    }

    getCurrentAudio(): HTMLAudioElement {
        return this.audio;
    }
}