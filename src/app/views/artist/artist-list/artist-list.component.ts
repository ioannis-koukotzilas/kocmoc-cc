import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { WPService } from "src/app/core/services/wp/wp.service";
import { Artist } from "src/app/models/artist";


@Component({
    selector: 'app-artist-list',
    templateUrl: './artist-list.component.html',
    styleUrls: ['./artist-list.component.css']
})

export class ArtistListComponent implements OnInit, OnDestroy {

    artists : Artist[] = [];
    private unsubscribe$ = new Subject<void>();

    constructor(private wpService: WPService) { }

    ngOnInit(): void {
        // this.getArtists();
    }

    // getArtists(): void {
    //     this.wordpressService.getArtists()
    //         .pipe(takeUntil(this.unsubscribe$))
    //         .subscribe(artists => this.artists = artists);
    // }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}