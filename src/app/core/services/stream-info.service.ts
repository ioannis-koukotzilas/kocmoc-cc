import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { LiveStreamTrack } from "src/app/models/liveStreamTrack";

@Injectable({
    providedIn: 'root',
})

export class StreamInfoService {
    private readonly API_URL = 'https://falcon.shoutca.st:2199/api.php?xm=server.getsongs&f=json&a[username]=kocmoc1&a[password]=i3Jiy8I9s1';

    constructor(private http: HttpClient) { }

    getStreamInfo(): Observable<LiveStreamTrack[]> {
        return this.http.get<{ response: { data: { songs: { track: LiveStreamTrack }[] } } }>(this.API_URL).pipe(
            map(response => response.response.data.songs.map(song => song.track))
        );
    }
}
