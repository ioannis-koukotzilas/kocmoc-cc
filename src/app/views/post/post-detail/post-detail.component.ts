import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WPService } from 'src/app/core/services/wp/wp.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {

  post: any;

  constructor(
    private route: ActivatedRoute,
    private wpService: WPService
  ) { }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id') ?? '';

    if (postId) {
      this.wpService.fetchPost(postId).subscribe({
        next: data => {
          this.post = data;
        },
        error: error => {
          console.error('There was an error: ', error);
        }
      });
    } else {
      console.error('Post ID is null');
    }
  }

}
