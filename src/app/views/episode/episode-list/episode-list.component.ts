import { Component, OnInit } from '@angular/core';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-episode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.css']
})

export class EpisodeListComponent implements OnInit {
  episodes: any[] = [];
  isLoading = true;

  constructor(private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.wordPressService.fetchEpisodes().subscribe({
      next: data => {
        this.episodes = data;
        this.isLoading = false;
      },
      error: error => {
        console.error('There was an error: ', error);
        this.isLoading = false;
      }
    });
  }

  hasThumbnail(episode: any): boolean {
    return episode._embedded && episode._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium;
  }

  getThumbnailUrl(episode: any): string {
    return episode._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;
  }

}
