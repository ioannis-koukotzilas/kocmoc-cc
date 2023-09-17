import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CloudStorageService {

  private bucketUrl = 'https://kocmoc-episodes.s3.eu-central-1.amazonaws.com';

  getOnDemandStreamUrl(fileName: string): string {
    return `${this.bucketUrl}/${fileName}`;
  }
}