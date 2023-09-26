import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';

@Component({
  selector: 'app-episode-audio-controls',
  templateUrl: './episode-audio-controls.component.html',
  styleUrls: ['./episode-audio-controls.component.css'],
})
export class EpisodeAudioControlsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  @Input() episode: any = null;
  @Input() currentOnDemandStream$!: Observable<Episode | null>;
  @Input() onDemandStreamLoading$!: Observable<boolean>;
  @Input() onDemandStreamPlaying$!: Observable<boolean>;

  loading: boolean = false;

  constructor(public audioPlayerService: AudioPlayerService) {}

  ngOnInit() {
    this.onDemandStreamLoading$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  playEpisode() {
    console.log('Episode data:', this.episode);

    if (!this.episode || !this.episode.track || this.loading) {
      return;
    }

    // If the live stream is playing, stop it
    if (this.audioPlayerService.liveStreamPlaying.value) {
      this.audioPlayerService.liveStreamStop();
    }

    // Toggle or play the on-demand stream
    if (
      this.audioPlayerService.currentOnDemandStream.value?.id ===
      this.episode.id
    ) {
      this.audioPlayerService.onDemandStreamTogglePlay(this.episode);
    } else {
      this.audioPlayerService.onDemandStreamPlay(this.episode);
    }
  }
}
