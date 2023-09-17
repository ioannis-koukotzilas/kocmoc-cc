import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioPlayerComponent } from './views/audio-player/audio-player.component';
import { PostListComponent } from './views/post/post-list/post-list.component';
import { PostDetailComponent } from './views/post/post-detail/post-detail.component';
import { EpisodeDetailComponent } from './views/episode/episode-detail/episode-detail.component';
import { EpisodeListComponent } from './views/episode/episode-list/episode-list.component';
import { GenreDetailComponent } from './views/genre/genre-detail/genre-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ArtistListComponent } from './views/artist/artist-list/artist-list.component';
import { ArtistDetailComponent } from './views/artist/artist-detail/artist-detail.component';
import { EpisodeAudioControlsComponent } from './views/episode/episode-audio-controls/episode-audio-controls.component';
import { EpisodeRelatedListComponent } from './views/episode/episode-related-list/episode-related-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
    PostListComponent,
    PostDetailComponent,
    EpisodeDetailComponent,
    EpisodeListComponent,
    GenreDetailComponent,
    ArtistListComponent,
    ArtistDetailComponent,
    EpisodeAudioControlsComponent,
    EpisodeRelatedListComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
