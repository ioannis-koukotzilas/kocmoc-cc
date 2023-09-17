import { Component, OnInit } from '@angular/core';

import { WPService } from './core/services/wp/wp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'KOCMOC.CC';
  posts: any[] = [];

  constructor(private wpService: WPService) { }

  ngOnInit(): void {
    this.wpService.fetchPosts().subscribe(data => {
      this.posts = data;
    });
  }
}