import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioPlayerComponent } from './views/audio-player/audio-player.component';
import { EpisodeDetailComponent } from './views/episode/episode-detail/episode-detail.component';
import { EpisodeListComponent } from './views/episode/episode-list/episode-list.component';
import { GenreDetailComponent } from './views/genre/genre-detail/genre-detail.component';
import { ArtistDetailComponent } from './views/artist/artist-detail/artist-detail.component';
import { ProducerListComponent } from './views/producer/producer-list/producer-list.component';
import { ProducerDetailComponent } from './views/producer/producer-detail/producer-detail.component';
import { ShowListComponent } from './views/show/show-list/show-list.component';
import { ShowDetailComponent } from './views/show/show-detail/show-detail.component';
import { GenreListComponent } from './views/genre/genre-list/genre-list.component';
import { HomeComponent } from './views/home/home.component';
import { ScheduleComponent } from './views/schedule/schedule.component';
import { ArtistListComponent } from './views/artist/artist-list/artist-list.component';
import { PageDetailComponent } from './views/page/page-detail/page-detail.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'producers', component: ProducerListComponent },
  { path: 'producer/:id', component: ProducerDetailComponent },
  { path: 'episodes', component: EpisodeListComponent },
  { path: 'episode/:id', component: EpisodeDetailComponent },
  { path: 'shows', component: ShowListComponent },
  { path: 'show/:id', component: ShowDetailComponent },
  { path: 'genres', component: GenreListComponent },
  { path: 'genre/:id', component: GenreDetailComponent },
  { path: 'audio-player', component: AudioPlayerComponent },
  { path: 'artists', component: ArtistListComponent },
  { path: 'artist/:id', component: ArtistDetailComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'page/:id', component: PageDetailComponent },
  // { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }