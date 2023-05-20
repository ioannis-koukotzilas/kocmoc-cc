import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeDetailComponent } from './episode-detail.component';

describe('EpisodeDetailComponent', () => {
  let component: EpisodeDetailComponent;
  let fixture: ComponentFixture<EpisodeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EpisodeDetailComponent]
    });
    fixture = TestBed.createComponent(EpisodeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
