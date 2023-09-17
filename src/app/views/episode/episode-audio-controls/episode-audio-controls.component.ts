import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';

@Component({
  selector: 'app-episode-audio-controls',
  templateUrl: './episode-audio-controls.component.html',
  styleUrls: ['./episode-audio-controls.component.css']
})
export class EpisodeAudioControlsComponent {

  @Input() episode: any = null;
  @Input() currentOnDemandStream$!: Observable<Episode | null>;
  @Input() onDemandStreamLoading$!: Observable<boolean>;
  @Input() onDemandStreamPlaying$!: Observable<boolean>;

  constructor(public audioPlayerService: AudioPlayerService) { }

  playEpisode() {
    console.log('Episode data:', this.episode);

    if (!this.episode || !this.episode.track) {
      return;
    }

    // If the live stream is playing, stop it
    if (this.audioPlayerService.liveStreamPlaying.value) {
      this.audioPlayerService.stopLiveStream();
    }

    // Toggle or play the on-demand stream
    if (this.audioPlayerService.currentOnDemandStream.value?.id === this.episode.id) {
      this.audioPlayerService.toggleOnDemandStream(this.episode);
    } else {
      this.audioPlayerService.playOnDemandStream(this.episode);
    }
  }
}