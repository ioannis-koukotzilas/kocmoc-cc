export class Episode {
    id: string;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    genre: string[];
    acf: {
        track_file_name: string;
    };

    constructor(
        id: string,
        date: string,
        title: { rendered: string },
        excerpt: { rendered: string },
        genre: string[],
        acf: { track_file_name: string }
    ) {
        this.id = id;
        this.date = date;
        this.excerpt = excerpt;
        this.title = title;
        this.genre = genre;
        this.acf = acf;
    }
}
