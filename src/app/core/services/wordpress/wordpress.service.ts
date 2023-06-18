import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Genre } from 'src/app/models/genre';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Show } from 'src/app/models/show';

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

// Add page and perPage parameters
// getQueriedEpisodes(perPage: number, page: number): Observable<Episode[]> {
//   return this.http.get<Episode[]>(`${this.baseUrl}/episode?per_page=${perPage}&page=${page}`)
//     .pipe(
//       catchError(this.handleError<Episode[]>('getEpisodes', []))
//     );
// }



getQueriedEpisodes(perPage: number, page: number): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
  return this.http.get<Episode[]>(`${this.baseUrl}/episode`, {
    params: { per_page: perPage.toString(), page: page.toString() },
    observe: 'response'
  })
  .pipe(
    map((response: HttpResponse<Episode[]>) => {
      return { episodes: response.body as Episode[], headers: response.headers };
    }),
    catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getEpisodes', { episodes: [], headers: new HttpHeaders() }))
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

  getArtistsByEpisodeIds(episodeIds: number[]): Observable<Artist[]> {
    const ids = episodeIds.join(',');
    return this.http.get<Artist[]>(`${this.baseUrl}/artist?episode=${ids}`)
      .pipe(
        catchError(this.handleError<Artist[]>('getArtistsByEpisodeIds', []))
      );
  }

  getShowsByEpisodeIds(episodeIds: number[]): Observable<Show[]> {
    const ids = episodeIds.join(',');
    return this.http.get<Show[]>(`${this.baseUrl}/show?episode=${ids}`)
      .pipe(
        catchError(this.handleError<Show[]>('getShowsByEpisodeIds', []))
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

  getGenresByEpisodeIds(episodeIds: number[]): Observable<Artist[]> {
    const ids = episodeIds.join(',');
    return this.http.get<Artist[]>(`${this.baseUrl}/genre?episode=${ids}`)
      .pipe(
        catchError(this.handleError<Artist[]>('getGenreByEpisodeIds', []))
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