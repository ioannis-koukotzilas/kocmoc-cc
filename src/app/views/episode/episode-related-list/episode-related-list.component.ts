import { Component, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Episode } from 'src/app/models/episode';

@Component({
  selector: 'app-episode-related-list',
  templateUrl: './episode-related-list.component.html',
  styleUrls: ['./episode-related-list.component.css']
})
export class EpisodeRelatedListComponent {

  @Input() currentOnDemandStream$!: Observable<Episode | null>;
  @Input() onDemandStreamLoading$!: Observable<boolean>;
  @Input() onDemandStreamPlaying$!: Observable<boolean>;

  @Input() episodes: Episode[] = [];
}