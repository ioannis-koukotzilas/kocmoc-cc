import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-episode-detail',
  templateUrl: './episode-detail.component.html',
  styleUrls: ['./episode-detail.component.css']
})
export class EpisodeDetailComponent implements OnInit {

  episode: any;

  constructor(private route: ActivatedRoute, private wordPressService: WordPressService) { }

  ngOnInit(): void {
    const episodeId = this.route.snapshot.paramMap.get('id') ?? '';

    if (episodeId) {
      this.wordPressService.fetchEpisode(episodeId).subscribe({
        next: data => {
          this.episode = data;
        },
        error: error => {
          console.error('There was an error: ', error);
        }
      });
    } else {
      console.error('Episode ID is null');
    }
  }

}