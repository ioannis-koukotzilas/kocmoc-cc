export class Tracklist {
  episodeId: number;
  tracks: {
    artistsTerms: {
      id: number;
      name: string;
    }[];
    artistName: string;
    title: string;
  }[];

  constructor(data: any) {
    this.episodeId = data.episodeId;
    this.tracks = data.tracks;
  }
}