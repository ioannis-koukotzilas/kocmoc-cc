import { Component, OnInit } from '@angular/core';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit {
  posts: any[] = [];
  isLoading = true;

  constructor(private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.wordPressService.fetchPosts().subscribe({
      next: data => {
        this.posts = data;
        this.isLoading = false;
      },
      error: error => {
        console.error('There was an error: ', error);
        this.isLoading = false;
      }
    });
  }

  hasThumbnail(post: any): boolean {
    return post._embedded && post._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium;
  }

  getThumbnailUrl(post: any): string {
    return post._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url;
  }

}
