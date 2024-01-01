import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioPlayerComponent } from './views/audio-player/audio-player.component';
import { EpisodeDetailComponent } from './views/episode/episode-detail/episode-detail.component';
import { EpisodeListComponent } from './views/episode/episode-list/episode-list.component';
import { GenreDetailComponent } from './views/genre/genre-detail/genre-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ArtistDetailComponent } from './views/artist/artist-detail/artist-detail.component';
import { EpisodeAudioControlsComponent } from './views/episode/episode-audio-controls/episode-audio-controls.component';
import { EpisodeRelatedListComponent } from './views/episode/episode-related-list/episode-related-list.component';
import { ProducerDetailComponent } from './views/producer/producer-detail/producer-detail.component';
import { ProducerListComponent } from './views/producer/producer-list/producer-list.component';
import { LazyLoadDirective } from './lazy-load.directive';
import { ScheduleComponent } from './views/schedule/schedule.component';
import { HttpErrorInterceptor } from './core/services/http-error.interceptor.service';
import { ShowDetailComponent } from './views/show/show-detail/show-detail.component';
import { ShowListComponent } from './views/show/show-list/show-list.component';
import { GenreListComponent } from './views/genre/genre-list/genre-list.component';
import { HomeComponent } from './views/home/home.component';
import { HeaderComponent } from './views/header/header.component';
import { FooterComponent } from './views/footer/footer.component';
import { IdentityLoaderComponent } from './views/identity-loader/identity-loader.component';
import { ArtistListComponent } from './views/artist/artist-list/artist-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
    EpisodeDetailComponent,
    EpisodeListComponent,
    GenreDetailComponent,
    ArtistDetailComponent,
    EpisodeAudioControlsComponent,
    EpisodeRelatedListComponent,
    ProducerDetailComponent,
    ProducerListComponent,
    LazyLoadDirective,
    ScheduleComponent,
    ShowDetailComponent,
    ShowListComponent,
    GenreListComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    IdentityLoaderComponent,
    ArtistListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
