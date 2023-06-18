import { ChangeDetectorRef, Component, OnDestroy, OnInit, } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { Episode } from 'src/app/models/episode';
import { LiveStreamTrack } from 'src/app/models/liveStreamTrack';
import { StreamInfoService } from 'src/app/core/services/stream-info.service';

const STREAM_TYPE_LIVE = 'liveStream';

@Component({
    selector: 'app-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrls: ['./audio-player.component.css'],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {

    private subscriptions: Subscription = new Subscription();

    public currentEpisode: Episode | null = null;

    public liveStreamLoading$: Observable<boolean> = this.audioPlayerService.liveStreamLoading$;
    public liveStreamPlaying$: Observable<boolean> = this.audioPlayerService.liveStreamPlaying$;
    public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
    public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;
    public streamTypeSelected$: Observable<string> = this.audioPlayerService.streamTypeSelected$;

    // Progress
    public onDemandStreamCurrentTime$: Observable<number> = this.audioPlayerService.onDemandStreamCurrentTime.asObservable();
    public onDemandStreamDuration$: Observable<number> = this.audioPlayerService.onDemandStreamDuration.asObservable();

    public currentLiveStreamTrack: LiveStreamTrack | null = null;

    constructor(public audioPlayerService: AudioPlayerService, private cdr: ChangeDetectorRef, private streamInfoService: StreamInfoService) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.audioPlayerService.currentOnDemandStream$.subscribe({
                next: data => {
                    this.currentEpisode = data;
                    this.cdr.markForCheck();
                },
                error: error => {
                    console.error('Error loading on demand stream:', error);
                }
            })
        );

        this.subscriptions.add(
            this.streamInfoService.getStreamInfo().subscribe({
                next: data => {
                    this.currentLiveStreamTrack = data[0];
                    this.cdr.markForCheck();
                },
                error: error => {
                    console.error('Error loading stream info:', error);
                }
            })
        );

        this.subscriptions.add(
            this.onDemandStreamCurrentTime$.subscribe(time => {
                console.log('Current Time:', time);
            })
        );
        
        this.subscriptions.add(
            this.onDemandStreamDuration$.subscribe(duration => {
                console.log('Duration:', duration);
            })
        );
        
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    toggleLiveStream(): void {
        this.audioPlayerService.streamTypeSelected.next('liveStream');
        this.audioPlayerService.toggleLiveStream();
    }

    toggleOnDemandStream(): void {
        const currentEpisode = this.audioPlayerService.currentOnDemandStream.value;
        if (currentEpisode) {
            this.audioPlayerService.streamTypeSelected.next('onDemandStream');
            if (this.audioPlayerService.currentOnDemandStream.value?.id === currentEpisode.id) {
                this.audioPlayerService.toggleOnDemandStream(currentEpisode);
            } else {
                this.audioPlayerService.playOnDemandStream(currentEpisode);
            }
        }
    }

    backToLiveStream(): void {
        this.audioPlayerService.streamTypeSelected.next(STREAM_TYPE_LIVE);
        this.audioPlayerService.playLiveStream();
    }

    // Progress


    
    // onScrub(event: Event): void {
    //     const inputElement = event.target as HTMLInputElement;
    //     if (inputElement && inputElement.value) {
    //         const scrubTime = parseFloat(inputElement.value);
    //         this.audioPlayerService.setOnDemandStreamCurrentTime(scrubTime);
    //     }
    // }

    // formatTime(timeInSeconds: number | null): string {
    //     if (timeInSeconds == null) return '00:00';
    
    //     const minutes: number = Math.floor(timeInSeconds / 60);
    //     const seconds: number = Math.floor(timeInSeconds % 60);
    //     return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    // }
    
    // updateSliderPercentage(event: Event): void {
    //     const inputElement = event.target as HTMLInputElement;
    //     if (inputElement && inputElement.value && inputElement.max) {
    //         const scrubTime = parseFloat(inputElement.value);
    //         const maxTime = parseFloat(inputElement.max);
    //         const percentage = (scrubTime / maxTime) * 100;
    //         inputElement.style.setProperty('--slider-percentage', `${percentage}%`);
    //     }
    // }

    onScrub(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        if (inputElement && inputElement.value) {
            const scrubTime = parseFloat(inputElement.value);
            this.audioPlayerService.setOnDemandStreamCurrentTime(scrubTime);
            this.updateSliderPercentage(inputElement);
        }
    }
    
    formatTime(timeInSeconds: number | null): string {
        if (timeInSeconds === null) {
            return '00:00';
        }
    
        const minutes: number = Math.floor(timeInSeconds / 60);
        const seconds: number = Math.floor(timeInSeconds % 60);
        return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    }
    
    updateSliderPercentage(inputElement: HTMLInputElement): void {
        if (inputElement && inputElement.value && inputElement.max) {
            const scrubTime = parseFloat(inputElement.value);
            const maxTime = parseFloat(inputElement.max);
            const percentage = (scrubTime / maxTime) * 100;
            inputElement.style.setProperty('--slider-percentage', `${percentage}%`);
        }
    }
    
    
    
}
