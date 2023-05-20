import { Component, OnInit } from '@angular/core';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit {
  posts: any[] = [];

  constructor(private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.wordPressService.fetchPosts().subscribe({
      next: data => {
        this.posts = data;
      },
      error: error => {
        console.error('There was an error: ', error);
      }
    });
  }
}
