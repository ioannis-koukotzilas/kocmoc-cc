import { Component, OnInit } from '@angular/core';

import { CloudStorageService } from './core/services/cloud-storage/cloud-storage.service';
import { WordPressService } from './core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'KOCMOC.CC';
  posts: any[] = [];

  constructor(private wordPressService: WordPressService) { }

  ngOnInit(): void {
    this.wordPressService.fetchPosts().subscribe(data => {
      this.posts = data;
    });
  }
}