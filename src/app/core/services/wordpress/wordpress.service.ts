import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Genre } from 'src/app/models/genre';
import { environment } from 'src/app/enviroments/environment';
import { Observable } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';

@Injectable({
  providedIn: 'root'
})

export class WordPressService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  fetchPosts() {
    return this.http.get<any[]>(`${this.baseUrl}/posts?_embed`);
  }

  fetchPost(id: string) {
    return this.http.get(`${this.baseUrl}/posts/${id}?_embed`);
  }

  fetchEpisodes() {
    return this.http.get<Episode[]>(`${this.baseUrl}/episode?_embed`);
  }

  fetchEpisode(id: string) {
    return this.http.get(`${this.baseUrl}/episode/${id}?_embed`);
  }

  fetchArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.baseUrl}/artist`);
  }

  fetchArtist(id: string): Observable<Artist> {
    return this.http.get<Artist>(`${this.baseUrl}/artist/${id}`);
  }

  fetchGenre(id: string) {
    return this.http.get<Genre>(`${this.baseUrl}/genre/${id}`);
  }

  fetchGenres(idsString: string): Observable<Genre[]> {
    // Include the idsString in the URL to fetch genres with these ids
    return this.http.get<Genre[]>(`${this.baseUrl}/genre?include=${idsString}`);
  }
  
  fetchEpisodesByGenre(genreId: string) {
    return this.http.get<Episode[]>(`${this.baseUrl}/episode?genre=${genreId}&_embed`);
  }

}