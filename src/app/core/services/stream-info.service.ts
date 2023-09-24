import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { LiveStreamEpisode } from "src/app/models/liveStreamEpisode";

@Injectable({
    providedIn: 'root',
})

export class StreamInfoService {
    private readonly API_URL = 'https://falcon.shoutca.st:2199/api.php?xm=server.getsongs&f=json&a[username]=kocmoc1&a[password]=i3Jiy8I9s1';

    constructor(private http: HttpClient) { }

    getStreamInfo(): Observable<LiveStreamEpisode[]> {
        return this.http.get<{ response: { data: { songs: { track: LiveStreamEpisode }[] } } }>(this.API_URL).pipe(
            map(response => response.response.data.songs.map(song => song.track))
        );
    }
}
