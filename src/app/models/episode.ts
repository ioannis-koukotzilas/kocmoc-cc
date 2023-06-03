export class Episode {
    id: string;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    genre: string[];
    acf: {
        mp3: string;
    };

    constructor(
        id: string,
        date: string,
        title: { rendered: string },
        excerpt: { rendered: string },
        genre: string[],
        acf: { mp3: string }
    ) {
        this.id = id;
        this.date = date;
        this.excerpt = excerpt;
        this.title = title;
        this.genre = genre;
        this.acf = acf;
    }
}
