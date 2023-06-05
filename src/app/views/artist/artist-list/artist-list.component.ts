import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { WordPressService } from "src/app/core/services/wordpress/wordpress.service";
import { Artist } from "src/app/models/artist";

@Component({
    selector: 'app-artist-list',
    templateUrl: './artist-list.component.html',
    styleUrls: ['./artist-list.component.css']
})

export class ArtistListComponent implements OnInit {

    artists$: Observable<Artist[]> = of([]);

    constructor(private wordpressService: WordPressService) { }

    ngOnInit(): void {
        this.artists$ = this.wordpressService.fetchArtists();
    }

}