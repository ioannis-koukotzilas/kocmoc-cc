import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Genre } from 'src/app/models/genre';
import { environment } from 'src/app/enviroments/environment';
import { Observable, catchError, of } from 'rxjs';
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

  getEpisodes(): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.baseUrl}/episode`)
      .pipe(
        catchError(this.handleError<Episode[]>('getEpisodes', []))
      );
  }

  getEpisode(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.baseUrl}/episode/${id}`)
      .pipe(
        catchError(this.handleError<Episode>(`getEpisode id=${id}`))
      );
  }

  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.baseUrl}/artist`)
      .pipe(
        catchError(this.handleError<Artist[]>('getArtists', []))
      );
  }

  getArtist(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.baseUrl}/artist/${id}`)
      .pipe(
        catchError(this.handleError<Artist>(`getArtist id=${id}`))
      );
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.baseUrl}/genre`)
      .pipe(
        catchError(this.handleError<Genre[]>('getGenres', []))
      );
  }

  getGenre(id: number): Observable<Genre> {
    return this.http.get<Genre>(`${this.baseUrl}/genre/${id}`)
      .pipe(
        catchError(this.handleError<Genre>(`getGenere id=${id}`))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}