import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Genre } from 'src/app/models/genre';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Show } from 'src/app/models/show';
import { Tracklist } from 'src/app/models/tracklist';

@Injectable({
  providedIn: 'root'
})

export class WPService {

  private wpJsonBaseUrl = environment.wpJsonBaseUrl;
  private customWpJsonBaseUrl = environment.customWpJsonBaseUrl;

  constructor(private http: HttpClient) { }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  getEpisodes(page: number, perPage: number): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
    return this.http.get<Episode[]>(`${this.wpJsonBaseUrl}/episode`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      },
      observe: 'response'
    }).pipe(
      map(({ body, headers }) => ({ episodes: body as Episode[], headers })),
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  getEpisode(id: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.wpJsonBaseUrl}/episode/${id}`).pipe(
      catchError(this.handleError<Episode>(`getEpisode id=${id}`))
    );
  }

  getEpisodeShow(id: number[]): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.customWpJsonBaseUrl}/show?episode=${id}`).pipe(
      catchError(this.handleError<Show[]>('getEpisodeShow', []))
    );
  }

  getEpisodeArtist(id: number[]): Observable<Artist[]> {
    return this.http.get<Artist[]>(`${this.customWpJsonBaseUrl}/artist?episode=${id}`).pipe(
      catchError(this.handleError<Artist[]>('getEpisodeArtist', []))
    );
  }

  getEpisodeGenre(id: number[]): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.customWpJsonBaseUrl}/genre?episode=${id}`).pipe(
      catchError(this.handleError<Genre[]>('getEpisodeGenre', []))
    );
  }

  getEpisodeTracklist(id: number[]): Observable<Tracklist[]> {
    return this.http.get<Tracklist[]>(`${this.customWpJsonBaseUrl}/tracklist?episode=${id}`).pipe(
      catchError(this.handleError<Tracklist[]>('getEpisodeTracklist', []))
    );
  }

  getRelatedEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
    return this.http.get<Episode[]>(`${this.wpJsonBaseUrl}/episode`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString(),
        show: id
      },
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Episode[]>) => {
        return { episodes: response.body as Episode[], headers: response.headers };
      }),
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getRelatedEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  // Artists

  getArtists(perPage: number, page: number): Observable<{ artists: Artist[], headers: HttpHeaders }> {
    return this.http.get<Artist[]>(`${this.wpJsonBaseUrl}/artist`, {
      params: {
        per_page: perPage.toString(),
        page: page.toString()
      },
      observe: 'response'
    }).pipe(
      map(({ body, headers }) => ({ artists: body as Artist[], headers })),
      catchError(this.handleError<{ artists: Artist[], headers: HttpHeaders }>('getArtists', {
        artists: [],
        headers: new HttpHeaders()
      }))
    );
  }

  getArtist(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.wpJsonBaseUrl}/artist/${id}`).pipe(
      catchError(this.handleError<Artist>(`getArtist id=${id}`))
    );
  }

  getArtistEpisode(id: number[]): Observable<Episode[]> {
    return this.http.get<Episode[]>(`${this.customWpJsonBaseUrl}/episode?artist=${id}`).pipe(
      catchError(this.handleError<Episode[]>('getArtistEpisode', []))
    );
  }

  // Need fix

  // getArtists(): Observable<Artist[]> {
  //   return this.http.get<Artist[]>(`${this.wpJsonBaseUrl}/artist`)
  //     .pipe(
  //       catchError(this.handleError<Artist[]>('getArtists', []))
  //     );
  // }

  // getArtist(id: number): Observable<Artist> {
  //   return this.http.get<Artist>(`${this.wpJsonBaseUrl}/artist/${id}`)
  //     .pipe(
  //       catchError(this.handleError<Artist>(`getArtist id=${id}`))
  //     );
  // }





  getQueriedShowsByEpisodeIds(episodeIds: number[], perPage: number, page: number): Observable<Show[]> {
    const ids = episodeIds.join(',');
    return this.http.get<Show[]>(`${this.wpJsonBaseUrl}/show?episode=${ids}&per_page=${perPage}&page=${page}`)
      .pipe(
        catchError(this.handleError<Show[]>('getShowsByEpisodeIds', []))
      );
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.wpJsonBaseUrl}/genre`)
      .pipe(
        catchError(this.handleError<Genre[]>('getGenres', []))
      );
  }

  getGenre(id: number): Observable<Genre> {
    return this.http.get<Genre>(`${this.wpJsonBaseUrl}/genre/${id}`)
      .pipe(
        catchError(this.handleError<Genre>(`getGenere id=${id}`))
      );
  }








  fetchPosts() {
    return this.http.get<any[]>(`${this.wpJsonBaseUrl}/posts?_embed`);
  }

  fetchPost(id: string) {
    return this.http.get(`${this.wpJsonBaseUrl}/posts/${id}?_embed`);
  }


}