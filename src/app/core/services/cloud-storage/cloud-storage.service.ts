import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CloudStorageService {

  private bucketUrl = 'https://storage.googleapis.com/kocmoc-cc/tracks';

  getOnDemandStreamUrl(fileName: string): string {
    return `${this.bucketUrl}/${fileName}`;
  }
}