import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription, filter, interval, of, startWith, switchMap, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { Episode } from 'src/app/models/episode';
import { LiveStreamEpisode } from 'src/app/models/liveStreamEpisode';
import { StreamInfoService } from 'src/app/core/services/stream-info.service';
import { Producer } from 'src/app/models/producer';
import { WPService } from 'src/app/core/services/wp/wp.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { Router } from '@angular/router';

const STREAM_TYPE_LIVE = 'liveStream';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  animations: [
    trigger('expandablePanelAnimation', [
      state(
        'expanded',
        style({
          transform: 'translateY(0)',
        })
      ),
      state(
        'collapsed',
        style({
          transform: 'translateY(-100%)',
        })
      ),
      transition('void => expanded', [
        style({
          transform: 'translateY(-100%)',
        }),
        animate('300ms ease-in-out'),
      ]),
      transition('expanded => void', [
        animate(
          '300ms ease-in-out',
          style({
            transform: 'translateY(-100%)',
          })
        ),
      ]),
    ]),
  ],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public liveStreamLoading$: Observable<boolean> = this.audioPlayerService.liveStreamLoading$;
  public liveStreamPlaying$: Observable<boolean> = this.audioPlayerService.liveStreamPlaying$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;
  public streamTypeSelected$: Observable<string> = this.audioPlayerService.streamTypeSelected$;

  public onDemandStreamCurrentTime$: Observable<number> = this.audioPlayerService.onDemandStreamCurrentTime.asObservable();
  public onDemandStreamDuration$: Observable<number> = this.audioPlayerService.onDemandStreamDuration.asObservable();

  public episode: Episode | null = null;
  public liveStreamEpisode: LiveStreamEpisode | null = null;
  public producer: Producer | null = null;

  public liveStreamExpandablePanelActive: boolean = false;
  public onDemandStreamExpandablePanelActive: boolean = false;

  @ViewChild('audioPlayer') audioPlayer: ElementRef = {} as ElementRef;

  currentMirrorStream: String | null = null;

  constructor(
    public audioPlayerService: AudioPlayerService,
    private streamInfoService: StreamInfoService,
    private wpService: WPService,
    private router: Router
  ) {}

  ngOnInit() {
    this.audioPlayerService.initializeLiveStream();

    this.subscriptions.add(
      this.audioPlayerService.currentOnDemandStream$.subscribe({
        next: (data) => {
          this.episode = data;
        },
        error: (error) => {
          console.error('Error loading on demand stream:', error);
        }
      })
    );

    const pollingInterval = 150000; // 2.5 Min
    this.subscriptions.add(
      interval(pollingInterval).pipe(
        startWith(0),
        tap(() => {
           this.audioPlayerService.liveStreamSet(true);
        }),
        switchMap(() => {
          const currentLiveStreamUrl = this.audioPlayerService.getCurrentLiveStreamUrl();
          if (currentLiveStreamUrl === this.audioPlayerService.getDefaultLiveStreamUrl()) {
            this.currentMirrorStream = null;
            return this.streamInfoService.getStreamInfo();
          } else {
            this.currentMirrorStream = this.audioPlayerService.findStreamNameByUrl(currentLiveStreamUrl);
            return of(null); // Skip if not default stream
          }
        })
      ).subscribe({
        next: (data) => {
          if (data) {
            this.liveStreamEpisode = data[0];
            this.matchProducerWithCentovaArtist();
          } else {
            this.liveStreamEpisode = null;
          }
        },
        error: (error) => {
          console.error('Error loading stream info:', error);
        }
      })
    );

    this.subscriptions.add(
      this.onDemandStreamCurrentTime$.subscribe({
        next: (time) => {
          const inputRange = document.querySelector('input[type="range"]') as HTMLInputElement;
          if (inputRange && inputRange.max) {
            const maxTime = parseFloat(inputRange.max);
            this.updateSliderPercentage(time, maxTime, inputRange);
          }
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
      if (
        this.audioPlayerService.currentOnDemandStream.value?.id ===
        currentEpisode.id
      ) {
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
      const scrubTime = parseFloat(inputElement.value);
      const maxTime = parseFloat(inputElement.max);
      this.audioPlayerService.onDemandStreamUpdateFromScrub(scrubTime);
      this.updateSliderPercentage(scrubTime, maxTime, inputElement);
    }
  }

  updateSliderPercentage(
    scrubTime: number,
    maxTime: number,
    inputElement: HTMLInputElement
  ) {
    const percentage = (scrubTime / maxTime) * 100;
    inputElement.style.setProperty('--slider-percentage', `${percentage}%`);
  }

  formatTime(timeInSeconds: number | null) {
    if (timeInSeconds === null) {
      return '00:00';
    }

    const totalMinutes: number = Math.floor(timeInSeconds / 60);
    const seconds: number = Math.floor(timeInSeconds % 60);

    return `${totalMinutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
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

  closePanel() {
    this.liveStreamExpandablePanelActive = false;
    this.onDemandStreamExpandablePanelActive = false;
  }

  navigateAfterClosePanel(route: any[]): void {
    this.closePanel();

    setTimeout(() => {
      this.router.navigate(route);
    }, 300);
  }

  private matchProducerWithCentovaArtist() {
    if (this.liveStreamEpisode && this.liveStreamEpisode.artist) {
      const centovaArtist = this.liveStreamEpisode.artist.toLowerCase();
      this.subscriptions.add(
        this.wpService.getProducerByName(centovaArtist).subscribe({
          next: (data) => {
            if (data) {
              this.producer = data;
            } else {
              this.producer = null;
            }
          },
          error: (error) => {
            console.error('Error get producer by name:', error);
          }
        })
      );
    }
  }
}
