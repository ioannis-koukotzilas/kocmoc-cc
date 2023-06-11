export class Episode {
    id: number;
    slug: string;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    image: {
        url: string,
        alt: string,
        caption: string,
        description: string,
        size: {
            [key: string]: string | number;
        }, 
    };
    acf: { track: string };
    artist: number[]; // To hold artist IDs from JSON response
    genre: number[];  // To hold genre IDs from JSON response

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.date = data.date;
        this.title = data.title;
        this.excerpt = data.excerpt;
        this.content = data.content;
        this.image = {
            url: data.featured_image.url,
            alt: data.featured_image.alt,
            caption: data.featured_image.caption,
            description: data.featured_image.description,
            size: data.featured_image.size,
        };
        this.acf = data.acf;
        this.artist = data.artist;
        this.genre = data.genre;
    }
}