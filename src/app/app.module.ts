import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { PostListComponent } from './views/post/post-list/post-list.component';
import { PostDetailComponent } from './views/post/post-detail/post-detail.component';
import { EpisodeDetailComponent } from './views/episode/episode-detail/episode-detail.component';
import { EpisodeListComponent } from './views/episode/episode-list/episode-list.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioPlayerComponent,
    PostListComponent,
    PostDetailComponent,
    EpisodeDetailComponent,
    EpisodeListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
