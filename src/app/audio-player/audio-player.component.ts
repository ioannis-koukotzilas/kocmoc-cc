import { Component, OnInit } from '@angular/core';
import { CloudStorageService } from '../cloud-storage.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit {
  
  audio: HTMLAudioElement;
  showAudioPlayer = false; 

  constructor(private cloudStorageService: CloudStorageService) { 
    this.audio = new Audio();
  }

  ngOnInit(): void {
    this.audio = document.getElementById('audioPlayer') as HTMLAudioElement;
  }

  playAudio(): void {
    this.audio?.play();
    this.showAudioPlayer = true;
  }

  pauseAudio(): void {
    this.audio?.pause();
    this.showAudioPlayer = true;
  }
}