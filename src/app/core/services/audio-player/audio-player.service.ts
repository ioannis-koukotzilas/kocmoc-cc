import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AudioPlayerService {
    private audioSubject = new BehaviorSubject<HTMLAudioElement | null>(null);
    audio$ = this.audioSubject.asObservable();

    setTrackUrl(url: string): void {
        const audio = new Audio(url);
        this.audioSubject.next(audio);
    }

    play(): void {
        this.audioSubject.getValue()?.play();
    }

    pause(): void {
        this.audioSubject.getValue()?.pause();
    }

    isPlaying(): boolean {
        const audio = this.audioSubject.getValue();
        return audio ? !audio.paused : false;
    }

    stop(): void {
        const audio = this.audioSubject.getValue();
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Resets the audio track to the beginning
        }
    }

    getCurrentAudio(): HTMLAudioElement | null {
        return this.audioSubject.getValue();
    }

}
