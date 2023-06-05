import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { CloudStorageService } from '../../core/services/cloud-storage/cloud-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AudioPlayerService {

    private liveStreamAudio: HTMLAudioElement = new Audio();
    private onDemandStreamAudio: HTMLAudioElement = new Audio();

    public liveStreamLoading = new BehaviorSubject<boolean>(false);
    public liveStreamPlaying = new BehaviorSubject<boolean>(false);
    public onDemandStreamLoading = new BehaviorSubject<boolean>(false);
    public onDemandStreamPlaying = new BehaviorSubject<boolean>(false);
    public streamTypeSelected = new BehaviorSubject<string>('liveStream');
    public currentOnDemandStream = new BehaviorSubject<Episode | null>(null);

    public liveStreamLoading$ = this.liveStreamLoading.asObservable();
    public liveStreamPlaying$ = this.liveStreamPlaying.asObservable();
    public onDemandStreamLoading$ = this.onDemandStreamLoading.asObservable();
    public onDemandStreamPlaying$ = this.onDemandStreamPlaying.asObservable();
    public streamTypeSelected$ = this.streamTypeSelected.asObservable();
    public currentOnDemandStream$ = this.currentOnDemandStream.asObservable();

    constructor(private cloudStorageService: CloudStorageService) {}

    setLiveStream(): void {
        this.liveStreamLoading.next(true);
        this.liveStreamAudio.src = 'https://kocmoc1-gecko.radioca.st/stream' + '?nocache=' + new Date().getTime();
    }

    playLiveStream(): void {
        this.stopOnDemandStream();
        this.setLiveStream();
        this.liveStreamAudio.addEventListener('canplaythrough', this.liveStreamCanPlayThroughListener);
    }

    pauseLiveStream(): void {
        this.liveStreamAudio.pause();
        this.liveStreamPlaying.next(false);
    }

    stopLiveStream(): void {
        this.liveStreamAudio.pause();
        this.liveStreamAudio.currentTime = 0;
        this.liveStreamPlaying.next(false);
        this.liveStreamLoading.next(false);
        this.liveStreamAudio.removeEventListener('canplaythrough', this.liveStreamCanPlayThroughListener);
    }

    private liveStreamCanPlayThroughListener = () => {
        setTimeout(() => {
            if (!this.liveStreamAudio.error) {
                this.liveStreamLoading.next(false);
                this.liveStreamPlaying.next(true);
                this.liveStreamAudio.play();
            } else {
                console.error(`Error loading live stream: ${this.liveStreamAudio.error.message}`);
            }
        }, 600);
    };

    toggleLiveStream(): void {
        this.liveStreamPlaying.value ? this.pauseLiveStream() : this.playLiveStream();
    }

    setOnDemandStream(episode: Episode): void {
        this.onDemandStreamLoading.next(true);
        this.onDemandStreamAudio.src = this.cloudStorageService.getOnDemandStreamUrl(episode.acf.track_file_name);
        this.currentOnDemandStream.next(episode);
    }

    playOnDemandStream(episode: Episode): void {
        this.streamTypeSelected.next('onDemandStream');
        this.stopLiveStream();
        this.setOnDemandStream(episode);
        this.onDemandStreamAudio.addEventListener('canplaythrough', this.onDemandStreamCanPlayThroughListener);
    }

    pauseOnDemandStream(): void {
        this.onDemandStreamAudio.pause();
        this.onDemandStreamPlaying.next(false);
        this.onDemandStreamAudio.removeEventListener('canplaythrough', this.onDemandStreamCanPlayThroughListener);
    }

    stopOnDemandStream(): void {
        this.onDemandStreamAudio.pause();
        this.onDemandStreamAudio.currentTime = 0;
        this.onDemandStreamPlaying.next(false);
        this.onDemandStreamLoading.next(false);
        this.onDemandStreamAudio.removeEventListener('canplaythrough', this.onDemandStreamCanPlayThroughListener);
    }

    private onDemandStreamCanPlayThroughListener = () => {
        setTimeout(() => {
            if (!this.onDemandStreamAudio.error) {
                this.onDemandStreamLoading.next(false);
                this.onDemandStreamPlaying.next(true);
                this.onDemandStreamAudio.play();
            } else {
                console.error(`Error loading on demand stream: ${this.onDemandStreamAudio.error.message}`);
            }
        }, 600);
    };

    toggleOnDemandStream(episode: Episode): void {
        this.streamTypeSelected.next('onDemandStream');
        this.onDemandStreamPlaying.value ? this.pauseOnDemandStream() : this.playOnDemandStream(episode);
    }

}
