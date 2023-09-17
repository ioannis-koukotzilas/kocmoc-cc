import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Episode } from 'src/app/models/episode';
import { Genre } from 'src/app/models/genre';

@Component({
  selector: 'app-genre-detail',
  templateUrl: './genre-detail.component.html',
  styleUrls: ['./genre-detail.component.css']
})

export class GenreDetailComponent implements OnInit {

  genre: Genre | undefined;
  episodes: Episode[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private wpService: WPService) { }

  ngOnInit(): void {
    this.getGenre();
  }

  getGenre(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.wpService.getGenre(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(genre => this.genre = genre);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
