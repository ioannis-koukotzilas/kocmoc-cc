import { Component, OnInit } from '@angular/core';
import { WpService } from './wp.service';
import { CloudStorageService } from './cloud-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'KOCMOC.CC';
  posts: any[] = [];
  trackUrl?: string;

  constructor(private wpService: WpService, private cloudStorageService: CloudStorageService) { }

  ngOnInit(): void {
    this.wpService.fetchPosts().subscribe(data => {
      this.posts = data;
    });
    const fileName = '2023_05_15_Advanced_Music_Designs_w_Ioannis.mp3';
    this.trackUrl = this.cloudStorageService.getTrackUrl(fileName);
  }
}

