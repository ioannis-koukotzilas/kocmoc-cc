import { Component, OnInit } from '@angular/core';

import { CloudStorageService } from './cloud-storage.service';
import { WordPressService } from './core/services/wordpress/wordpress.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'KOCMOC.CC';
  posts: any[] = [];
  trackUrl?: string;

  constructor(private wordPressService: WordPressService, private cloudStorageService: CloudStorageService) { }

  ngOnInit(): void {
    this.wordPressService.fetchPosts().subscribe(data => {
      this.posts = data;
    });
    const fileName = '2023_05_15_Advanced_Music_Designs_w_Ioannis.mp3';
    this.trackUrl = this.cloudStorageService.getTrackUrl(fileName);
  }
}