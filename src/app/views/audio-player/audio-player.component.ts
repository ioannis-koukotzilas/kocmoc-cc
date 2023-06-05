import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { ScriptLoaderService } from 'src/app/core/services/script-loader.service';
import { Episode } from 'src/app/models/episode';
import { LiveStreamTrack } from 'src/app/models/liveStreamTrack';
import { StreamInfoService } from 'src/app/core/services/stream-info.service';

@Component({
    selector: 'app-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrls: ['./audio-player.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit, OnDestroy {

    private subscriptions: Subscription = new Subscription();

    public currentEpisode: Episode | null = null;

    public liveStreamLoading$: Observable<boolean>;
    public liveStreamPlaying$: Observable<boolean>;
    public onDemandStreamLoading$: Observable<boolean>;
    public onDemandStreamPlaying$: Observable<boolean>;
    public streamTypeSelected$: Observable<string>;

    public currentLiveStreamTrack: LiveStreamTrack | null = null;

    constructor(public audioPlayerService: AudioPlayerService, private cdr: ChangeDetectorRef, private scriptLoader: ScriptLoaderService, private streamInfoService: StreamInfoService) {
        this.liveStreamLoading$ = this.audioPlayerService.liveStreamLoading$;
        this.liveStreamPlaying$ = this.audioPlayerService.liveStreamPlaying$;
        this.onDemandStreamLoading$ = this.audioPlayerService.onDemandStreamLoading$;
        this.onDemandStreamPlaying$ = this.audioPlayerService.onDemandStreamPlaying$;
        this.streamTypeSelected$ = this.audioPlayerService.streamTypeSelected$;
    }

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
        this.audioPlayerService.streamTypeSelected.next('liveStream');
        this.audioPlayerService.stopOnDemandStream();
        this.audioPlayerService.playLiveStream();
        this.scriptLoader
            .loadScript(
                'https://falcon.shoutca.st/system/streaminfo.js',
                'streaminfo-script'
            )
            .then(() => {
                console.log('Script loaded successfully');
            })
            .catch((err) => {
                console.error('Failed to load script', err);
            });
    }

}
