import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { Genre } from 'src/app/models/genre';

@Component({
  selector: 'app-genre-detail',
  templateUrl: './genre-detail.component.html',
  styleUrls: ['./genre-detail.component.css']
})

export class GenreDetailComponent implements OnInit {
  genreId!: string;
  genre: Genre | null = null;
  episodes: Episode[] = [];
  isLoading = true;
  subscription: Subscription | undefined;

  constructor(private route: ActivatedRoute, private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.subscription = this.route.params.pipe(
      switchMap(params => {
        this.genreId = params['id'];
        return this.wordPressService.fetchGenre(this.genreId);
      })
    ).subscribe(genre => {
      this.genre = genre;
      this.fetchEpisodes();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  fetchEpisodes(): void {
    this.wordPressService.fetchEpisodesByGenre(this.genreId).subscribe(episodes => {
      this.episodes = episodes;
      this.isLoading = false;
    });
  }

  // Check if an episode has a thumbnail
  hasThumbnail(episode: any): boolean {
    return episode._embedded && episode._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium;
  }

  // Get the thumbnail URL of an episode
  getThumbnailUrl(episode: any): string {
    return episode._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;
  }


}
