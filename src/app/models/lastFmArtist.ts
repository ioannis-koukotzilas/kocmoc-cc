export class LastFmArtist {
  name: string;
  url: string;
  bio: {
    published: string;
    summary: string;
    content: string;
  };

  constructor(data: any) {
    const artist = data.artist;

    this.name = artist.name;
    this.url = artist.url;
    this.bio = {
      published: artist.bio.published,
      summary: this.stripLastFmLink(artist.bio.summary),
      content: this.stripLastFmLink(artist.bio.content)
    };
  }

  private stripLastFmLink(text: string): string {
    const linkStart = text.indexOf('<a href="https://www.last.fm');
    if (linkStart !== -1) {
      return text.substring(0, linkStart).trim();
    }
    return text;
  }
}