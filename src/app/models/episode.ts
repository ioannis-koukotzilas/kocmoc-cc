export class Episode {
    id: number;
    slug: string;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    acf: { track_file_name: string };
    artist: number[]; // To hold artist IDs from JSON response
    genre: number[];  // To hold genre IDs from JSON response
   
    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.date = data.date;
        this.title = data.title;
        this.excerpt = data.excerpt;
        this.content = data.content;
        this.acf = data.acf;
        this.artist = data.artist;
        this.genre = data.genre;
    }
}

