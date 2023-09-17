import { Component, OnInit } from '@angular/core';
import { WPService } from 'src/app/core/services/wp/wp.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit {
  posts: any[] = [];
  isLoading = true;

  constructor(private wpService: WPService) { }

  ngOnInit(): void {
    this.wpService.fetchPosts().subscribe({
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
