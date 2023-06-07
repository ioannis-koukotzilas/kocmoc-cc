import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, catchError, of, switchMap } from "rxjs";
import { WordPressService } from "src/app/core/services/wordpress/wordpress.service";
import { Artist } from "src/app/models/artist";

@Component({
    selector: 'app-artist-detail',
    templateUrl: './artist-detail.component.html',
    styleUrls: ['./artist-detail.component.css']
})

export class ArtistDetailComponent implements OnInit {

    artist$: Observable<Artist> = of();

    constructor(private route: ActivatedRoute, private wordPressService: WordPressService) {}

    ngOnInit(): void {
        this.artist$ = this.route.paramMap.pipe(
            switchMap(params => {
                const artistId = params.get('id') || '';
                return this.wordPressService.fetchArtist(artistId);
            })
        );
    }
}