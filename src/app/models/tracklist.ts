export class Tracklist {
  episodeId: number;
  tracks: {
    artistTerms: {
      id: number;
      name: string;
    }[];
    title: string;
  }[];

  constructor(data: any) {
    this.episodeId = data.episodeId;
    this.tracks = data.tracks;
  }
}