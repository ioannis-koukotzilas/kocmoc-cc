import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { AudioPlayerService } from 'src/app/core/services/audio-player/audio-player.service';
import { ScriptLoaderService } from 'src/app/core/services/script-loader.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public currentEpisodeTitle = '';

  private _currentAudio: HTMLAudioElement | null = null;

  get currentAudio(): HTMLAudioElement | null {
    return this._currentAudio;
  }

  set currentAudio(value: HTMLAudioElement | null) {
    this._currentAudio = value;
  }

  constructor(
    public audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef,
    private scriptLoader: ScriptLoaderService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.audioPlayerService.currentEpisode$.subscribe((episode) => {
        if (episode) {
          this.currentEpisodeTitle = episode.title.rendered;
          this.currentAudio = this.audioPlayerService.getCurrentAudio();
        } else {
          this.currentEpisodeTitle = '';
          this.currentAudio = null;
        }
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.audioPlayerService.isPlaying.subscribe(() => {
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleLiveStream(): void {
    if (this.audioPlayerService.activeStream === 'liveStream') {
      if (this.audioPlayerService.isPlaying.getValue()) {
        this.audioPlayerService.pause();
      } else {
        this.audioPlayerService.play();
      }
    } else {
      this.audioPlayerService.setLiveStream();
    }
}

toggleEpisode(): void {
    if (
      this.audioPlayerService.activeStream === 'episode' &&
      this.audioPlayerService.isPlaying.getValue()
    ) {
      this.audioPlayerService.pause();
    } else if (
      this.audioPlayerService.isEpisodeLoaded
    ) {
      this.audioPlayerService.play();
    }
}


  backToLiveStream(): void {
    this.audioPlayerService.setLiveStream();
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

  playCurrentStream(): void {
    if (!this.audioPlayerService.isPlaying) {
      this.audioPlayerService.play();
    }
  }

  pauseCurrentStream(): void {
    if (this.audioPlayerService.isPlaying) {
      this.audioPlayerService.pause();
    }
  }
}
