import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { WordPressService } from "src/app/core/services/wordpress/wordpress.service";
import { Artist } from "src/app/models/artist";

@Component({
    selector: 'app-artist-detail',
    templateUrl: './artist-detail.component.html',
    styleUrls: ['./artist-detail.component.css']
})

export class ArtistDetailComponent implements OnInit {

    artist: Artist | undefined;
    private unsubscribe$ = new Subject<void>();

    constructor(private route: ActivatedRoute, private wordPressService: WordPressService) { }

    ngOnInit(): void {
        this.getArtist();
    }

    getArtist(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.wordPressService.getArtist(id)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(artist => this.artist = artist);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}