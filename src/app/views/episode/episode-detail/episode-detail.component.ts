import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';

@Component({
  selector: 'app-episode-detail',
  templateUrl: './episode-detail.component.html',
  styleUrls: ['./episode-detail.component.css']
})
export class EpisodeDetailComponent implements OnInit {

  episode$: Observable<Episode> = of();

  constructor(private route: ActivatedRoute, private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.episode$ = this.route.paramMap.pipe(
        switchMap(params => {
            const episodeId = params.get('id') || '';
            return this.wordPressService.fetchEpisode(episodeId);
        })
    );
}

}