import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { PostListComponent } from './views/post/post-list/post-list.component';
import { PostDetailComponent } from './views/post/post-detail/post-detail.component';
import { EpisodeDetailComponent } from './views/episode/episode-detail/episode-detail.component';
import { EpisodeListComponent } from './views/episode/episode-list/episode-list.component';

const routes: Routes = [
  { path: 'posts', component: PostListComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'episodes', component: EpisodeListComponent },
  { path: 'episode/:id', component: EpisodeDetailComponent },
  { path: 'audio-player', component: AudioPlayerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }