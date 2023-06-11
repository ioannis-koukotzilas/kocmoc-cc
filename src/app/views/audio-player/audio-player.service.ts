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

    constructor(private cloudStorageService: CloudStorageService) {
        this.liveStreamAudio.preload = 'auto';
        this.onDemandStreamAudio.preload = 'auto';

        this.liveStreamAudio.addEventListener('loadeddata', () => { console.log('liveStreamAudio loadeddata'); });
        this.liveStreamAudio.addEventListener('canplay', () => { console.log('liveStreamAudio canplay'); });
        this.liveStreamAudio.addEventListener('waiting', () => { console.log('liveStreamAudio waiting'); });
        this.liveStreamAudio.addEventListener('playing', () => { console.log('liveStreamAudio playing'); });

        this.onDemandStreamAudio.addEventListener('loadeddata', () => { console.log('onDemandStreamAudio loadeddata'); });
        this.onDemandStreamAudio.addEventListener('canplay', () => { console.log('onDemandStreamAudio canplay'); });
        this.onDemandStreamAudio.addEventListener('waiting', () => { console.log('onDemandStreamAudio waiting'); });
        this.onDemandStreamAudio.addEventListener('playing', () => { console.log('onDemandStreamAudio playing'); });
    }

    setLiveStream(): void {
        this.liveStreamLoading.next(true);
        this.liveStreamAudio.src = 'https://kocmoc1-gecko.radioca.st/stream' + '?nocache=' + new Date().getTime();
    }

    playLiveStream(): void {
        if (this.onDemandStreamPlaying.value) {
            this.stopOnDemandStream();
        }
        this.setLiveStream();
        this.liveStreamAudio.addEventListener('canplay', this.liveStreamCanPlayListener);
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
        this.liveStreamAudio.removeEventListener('canplay', this.liveStreamCanPlayListener);
    }

    private liveStreamCanPlayListener = () => {
        setTimeout(() => {
            if (!this.liveStreamAudio.error) {
                this.liveStreamLoading.next(false);
                this.liveStreamPlaying.next(true);
                this.liveStreamAudio.play();
            } else {
                console.error(`Error loading live stream: ${this.liveStreamAudio.error.message}`);
            }
        }, 300);
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
        if (this.liveStreamPlaying.value) {
            this.stopLiveStream();
        }
        this.streamTypeSelected.next('onDemandStream');
        this.setOnDemandStream(episode);
        this.onDemandStreamAudio.addEventListener('canplay', this.onDemandStreamCanPlayListener);
    }

    resumeOnDemandStream(): void {
        if (this.onDemandStreamAudio.paused && !this.onDemandStreamAudio.ended) {
            this.onDemandStreamAudio.play();
            this.onDemandStreamPlaying.next(true);
        }
    }

    pauseOnDemandStream(): void {
        this.onDemandStreamAudio.pause();
        this.onDemandStreamPlaying.next(false);
        this.onDemandStreamAudio.removeEventListener('canplay', this.onDemandStreamCanPlayListener);
    }

    stopOnDemandStream(): void {
        this.onDemandStreamAudio.pause();
        this.onDemandStreamAudio.currentTime = 0;
        this.onDemandStreamPlaying.next(false);
        this.onDemandStreamLoading.next(false);
        this.onDemandStreamAudio.removeEventListener('canplay', this.onDemandStreamCanPlayListener);
    }

    private onDemandStreamCanPlayListener = () => {
        setTimeout(() => {
            if (!this.onDemandStreamAudio.error) {
                this.onDemandStreamLoading.next(false);
                this.onDemandStreamPlaying.next(true);
                this.onDemandStreamAudio.play();
            } else {
                console.error(`Error loading on demand stream: ${this.onDemandStreamAudio.error.message}`);
            }
        }, 300);
    };

    toggleOnDemandStream(episode: Episode): void {
        this.streamTypeSelected.next('onDemandStream');
        if (this.onDemandStreamPlaying.value) {
            this.pauseOnDemandStream();
        } else if (this.currentOnDemandStream.value?.id === episode.id) {
            this.resumeOnDemandStream();
        } else {
            this.playOnDemandStream(episode);
        }
    }

}
