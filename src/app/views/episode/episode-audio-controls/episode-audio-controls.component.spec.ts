import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeAudioControlsComponent } from './episode-audio-controls.component';

describe('EpisodeAudioControlsComponent', () => {
  let component: EpisodeAudioControlsComponent;
  let fixture: ComponentFixture<EpisodeAudioControlsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EpisodeAudioControlsComponent]
    });
    fixture = TestBed.createComponent(EpisodeAudioControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
