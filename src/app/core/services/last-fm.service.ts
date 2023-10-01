import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LastFmService {

  private readonly API_KEY = '0ee5cc8cc3fbbe19ac56d163609f7840';
  private readonly BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

  constructor(private http: HttpClient) {}

  getArtistMetadata(artistName: string) {
    const params = {
      method: 'artist.getinfo',
      artist: artistName,
      api_key: this.API_KEY,
      format: 'json',
    };
    return this.http.get(this.BASE_URL, { params });
  }
}