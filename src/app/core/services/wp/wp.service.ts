import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Genre } from 'src/app/models/genre';
import { environment } from 'src/environments/environment';
import { Observable, catchError, map, of } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Show } from 'src/app/models/show';
import { Tracklist } from 'src/app/models/tracklist';
import { Producer } from 'src/app/models/producer';
import { HomePage } from 'src/app/models/homePage';

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

  getEpisodeProducer(id: number[]): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/producer?episode=${id}`).pipe(
      catchError(this.handleError<Producer[]>('getEpisodeProducer', []))
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

  getRelatedShowEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
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
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getRelatedShowEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  // Producer

  getProducers(page: number, perPage: number): Observable<{ producers: Producer[], headers: HttpHeaders }> {
    return this.http.get<Producer[]>(`${this.wpJsonBaseUrl}/producer`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      },
      observe: 'response'
    }).pipe(
      map(({ body, headers }) => ({ producers: body as Producer[], headers })),
      catchError(this.handleError<{ producers: Producer[], headers: HttpHeaders }>('getProducers', {
        producers: [],
        headers: new HttpHeaders()
      }))
    );
  }

  getProducer(id: number): Observable<Producer> {
    return this.http.get<Producer>(`${this.wpJsonBaseUrl}/producer/${id}`).pipe(
      catchError(this.handleError<Producer>(`getProducer id=${id}`))
    );
  }

  getProducerShows(id: number[]): Observable<Show[]> {
    return this.http.get<Show[]>(`${this.customWpJsonBaseUrl}/producer-shows?producer=${id}`).pipe(
      catchError(this.handleError<Show[]>('getProducerShows', []))
    );
  }

  getProducerEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
    return this.http.get<Episode[]>(`${this.wpJsonBaseUrl}/episode`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString(),
        producer: id
      },
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Episode[]>) => {
        return { episodes: response.body as Episode[], headers: response.headers };
      }),
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getProducerEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  getProducerByName(name: string): Observable<Producer> {
    return this.http.get<Producer>(`${this.customWpJsonBaseUrl}/producer-by-name`, {
      params: {
        name: name
      },
    }).pipe(
      catchError(this.handleError<Producer>(`getProducerByName name=${name}`))
    );
  }

  // Show

  getShow(id: number): Observable<Show> {
    return this.http.get<Show>(`${this.wpJsonBaseUrl}/show/${id}`).pipe(
      catchError(this.handleError<Show>(`getShow id=${id}`))
    );
  }

  getShowProducers(id: number[]): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/show-producers?show=${id}`).pipe(
      catchError(this.handleError<Producer[]>('getShowProducers', []))
    );
  }

  getShowEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
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
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getShowEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  // Genre

  getGenres(page: number, perPage: number): Observable<{ genres: Genre[], headers: HttpHeaders }> {
    return this.http.get<Genre[]>(`${this.wpJsonBaseUrl}/genre`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      },
      observe: 'response'
    }).pipe(
      map(({ body, headers }) => ({ genres: body as Genre[], headers })),
      catchError(this.handleError<{ genres: Genre[], headers: HttpHeaders }>('getGenres', {
        genres: [],
        headers: new HttpHeaders()
      }))
    );
  }

  getGenre(id: number): Observable<Genre> {
    return this.http.get<Genre>(`${this.wpJsonBaseUrl}/genre/${id}`).pipe(
      catchError(this.handleError<Genre>(`getGenre id=${id}`))
    );
  }

  getGenreEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
    return this.http.get<Episode[]>(`${this.wpJsonBaseUrl}/episode`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString(),
        genre: id
      },
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Episode[]>) => {
        return { episodes: response.body as Episode[], headers: response.headers };
      }),
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getGenreEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  // Artists

  getArtists(page: number, perPage: number): Observable<{ artists: Artist[], headers: HttpHeaders }> {
    return this.http.get<Artist[]>(`${this.wpJsonBaseUrl}/artist`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
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

  getRelatedArtistEpisodes(page: number, perPage: number, id: number[]): Observable<{ episodes: Episode[], headers: HttpHeaders }> {
    return this.http.get<Episode[]>(`${this.wpJsonBaseUrl}/episode`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString(),
        artist: id
      },
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<Episode[]>) => {
        return { episodes: response.body as Episode[], headers: response.headers };
      }),
      catchError(this.handleError<{ episodes: Episode[], headers: HttpHeaders }>('getRelatedArtistEpisodes', {
        episodes: [],
        headers: new HttpHeaders()
      }))
    );
  }

  // Random selection

  getActiveGenres(page: number, perPage: number): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.customWpJsonBaseUrl}/active-genres`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      }
    }).pipe(
      catchError(this.handleError<Genre[]>('getActiveGenres', []))
    );
  }

  // Pages

  getHomePage(id: number): Observable<HomePage> {
    return this.http.get<HomePage>(`${this.wpJsonBaseUrl}/pages/${id}`).pipe(
      catchError(this.handleError<HomePage>(`getPage id=${id}`))
    );
  }


  // Need fix

  getQueriedShowsByEpisodeIds(episodeIds: number[], perPage: number, page: number): Observable<Show[]> {
    const ids = episodeIds.join(',');
    return this.http.get<Show[]>(`${this.wpJsonBaseUrl}/show?episode=${ids}&per_page=${perPage}&page=${page}`)
      .pipe(
        catchError(this.handleError<Show[]>('getShowsByEpisodeIds', []))
      );
  }

  // getGenres(): Observable<Genre[]> {
  //   return this.http.get<Genre[]>(`${this.wpJsonBaseUrl}/genre`)
  //     .pipe(
  //       catchError(this.handleError<Genre[]>('getGenres', []))
  //     );
  // }

  // nEW

  getActiveResidentProducers(): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/producers/?type=resident&status=active`).pipe(
      catchError(this.handleError<Producer[]>('getActiveResidentProducers', []))
    );
  }

  getActiveGuestProducers(): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/producers/?type=guest&status=active`).pipe(
      catchError(this.handleError<Producer[]>('getActiveGuestProducers', []))
    );
  }

  getInactiveResidentProducers(): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/producers/?type=resident&status=inactive`).pipe(
      catchError(this.handleError<Producer[]>('getInactiveResidentProducers', []))
    );
  }

  getInactiveGuestProducers(): Observable<Producer[]> {
    return this.http.get<Producer[]>(`${this.customWpJsonBaseUrl}/producers/?type=guest&status=inactive`).pipe(
      catchError(this.handleError<Producer[]>('getInactiveGuestProducers', []))
    );
  }

  

}