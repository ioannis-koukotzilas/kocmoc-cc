import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { Episode } from 'src/app/models/episode';
import { LiveStreamEpisode } from 'src/app/models/liveStreamEpisode';
import { StreamInfoService } from 'src/app/core/services/stream-info.service';
import { Producer } from 'src/app/models/producer';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

const STREAM_TYPE_LIVE = 'liveStream';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  animations: [
    trigger('expandablePanelAnimation', [
      state('expanded', style({
        transform: 'translateY(0)'
      })),
      state('collapsed', style({
        transform: 'translateY(-100%)'
      })),
      transition('void => expanded', [
        style({
          transform: 'translateY(-100%)'
        }),
        animate('200ms ease-in-out')
      ]),
      transition('expanded => void', [
        animate('200ms ease-in-out', style({
          transform: 'translateY(-100%)'
        }))
      ])
    ])
  ]
})
export class AudioPlayerComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();

  public episode: Episode | null = null;

  public liveStreamLoading$: Observable<boolean> = this.audioPlayerService.liveStreamLoading$;
  public liveStreamPlaying$: Observable<boolean> = this.audioPlayerService.liveStreamPlaying$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;
  public streamTypeSelected$: Observable<string> = this.audioPlayerService.streamTypeSelected$;

  // Progress
  public onDemandStreamCurrentTime$: Observable<number> = this.audioPlayerService.onDemandStreamCurrentTime.asObservable();
  public onDemandStreamDuration$: Observable<number> = this.audioPlayerService.onDemandStreamDuration.asObservable();

  public liveStreamEpisode: LiveStreamEpisode | null = null;
  public producer: Producer | null = null;

  public liveStreamExpandablePanelActive: boolean = false;
  public onDemandStreamExpandablePanelActive: boolean = false;

  @ViewChild('audioPlayer') audioPlayer: ElementRef = {} as ElementRef;

  constructor(public audioPlayerService: AudioPlayerService, private streamInfoService: StreamInfoService, private wpService: WPService) { }

  ngOnInit() {
    this.subscriptions.add(
      this.audioPlayerService.currentOnDemandStream$.subscribe({
        next: data => {
          this.episode = data;
          console.log('Received new data:', data);
        },
        error: error => {
          console.error('Error loading on demand stream:', error);
        },
        complete: () => {
          console.log('onDemandStream$ completed');
        }
      })
    );

    this.subscriptions.add(
      this.streamInfoService.getStreamInfo().subscribe({
        next: data => {
          this.liveStreamEpisode = data[0];
          this.matchProducerWithCentovaArtist();
        },
        error: error => {
          console.error('Error loading stream info:', error);
        },
        complete: () => {
          console.log('getStreamInfo$ completed');
        }
      })
    );

    this.subscriptions.add(
      this.onDemandStreamCurrentTime$.subscribe({
        next: time => {
          // console.log('Current Time:', time);
          const inputRange = document.querySelector('input[type="range"]') as HTMLInputElement;
          if (inputRange && inputRange.max) {
            const maxTime = parseFloat(inputRange.max);
            this.updateSliderPercentage(time, maxTime, inputRange);
          }
        },
        complete: () => {
          console.log('onDemandStreamCurrentTime$ completed');
        }
      })
    );

    this.subscriptions.add(
      this.onDemandStreamDuration$.subscribe({
        next: duration => {
          console.log('Duration:', duration);
        },
        complete: () => {
          console.log('onDemandStreamDuration$ completed');
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  liveStreamTogglePlay() {
    this.audioPlayerService.streamTypeSelected.next('liveStream');
    this.audioPlayerService.liveStreamTogglePlay();
  }

  onDemandStreamTogglePlay() {
    const currentEpisode = this.audioPlayerService.currentOnDemandStream.value;
    if (currentEpisode) {
      this.audioPlayerService.streamTypeSelected.next('onDemandStream');
      if (this.audioPlayerService.currentOnDemandStream.value?.id === currentEpisode.id) {
        this.audioPlayerService.onDemandStreamTogglePlay(currentEpisode);
      } else {
        this.audioPlayerService.onDemandStreamPlay(currentEpisode);
      }
    }
  }

  backToLiveStream() {
    this.audioPlayerService.streamTypeSelected.next(STREAM_TYPE_LIVE);
    this.audioPlayerService.liveStreamPlay();
  }

  onScrub(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value && inputElement.max) {
      this.audioPlayerService.onDemandStreamLoading.next(true);
      const scrubTime = parseFloat(inputElement.value);
      const maxTime = parseFloat(inputElement.max);
      this.audioPlayerService.onDemandStreamSetCurrentTime(scrubTime);
      this.updateSliderPercentage(scrubTime, maxTime, inputElement);
    }
  }

  updateSliderPercentage(scrubTime: number, maxTime: number, inputElement: HTMLInputElement) {
    const percentage = (scrubTime / maxTime) * 100;
    inputElement.style.setProperty('--slider-percentage', `${percentage}%`);
  }

  formatTime(timeInSeconds: number | null) {
    if (timeInSeconds === null) {
      return '00:00';
    }

    const totalMinutes: number = Math.floor(timeInSeconds / 60);
    const seconds: number = Math.floor(timeInSeconds % 60);

    return `${totalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  liveStreamToggleExpandablePanel() {
    this.liveStreamExpandablePanelActive = !this.liveStreamExpandablePanelActive;
  }

  onDemandStreamToggleExpandablePanel() {
    this.onDemandStreamExpandablePanelActive = !this.onDemandStreamExpandablePanelActive;
  }

  @HostListener('document:click', ['$event'])
  public documentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (!this.audioPlayer.nativeElement.contains(targetElement)) {
      this.liveStreamExpandablePanelActive = false;
      this.onDemandStreamExpandablePanelActive = false;
    }
  }

  private matchProducerWithCentovaArtist() {
    if (this.liveStreamEpisode && this.liveStreamEpisode.artist) {
      const centovaArtist = this.liveStreamEpisode.artist.toLowerCase();

      this.wpService.getProducerByName(centovaArtist).subscribe({
        next: (data) => {
          if (data) {
            this.producer = data;
          } else {
            this.producer = null;
          }
        },
        error: (error) => {
          console.error("Error get producer by name:", error);
        }
      });
    }
  }
}