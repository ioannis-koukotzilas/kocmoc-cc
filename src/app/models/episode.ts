export class Episode {
    id: number;
    slug: string;
    date: string;
    title: string;
    excerpt: string;
    content: string;
    image: {
        url: string,
        alt: string,
        caption: string,
        description: string,
        size: {
            [key: string]: string | number;
        }, 
    };
    track: string; // To hold track name from ACF
    location: string;

    tracklist: {
        track: {
            tracklist_artist: number[];
            title: string;
        }
    }[]; // tracklist is an array

    show: number[]; // To hold shows IDs from JSON response
    artist: number[]; // To hold artist IDs from JSON response
    genre: number[];  // To hold genre IDs from JSON response

    

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.date = data.date;
        this.title = data.title.rendered;
        this.excerpt = data.excerpt.rendered;
        this.content = data.content.rendered;
        this.image = {
            url: data.image.url,
            alt: data.image.alt,
            caption: data.image.caption,
            description: data.image.description,
            size: data.image.size,
        };
        this.track = data.acf.track;
        this.location = data.acf.location;

        this.tracklist = data.acf.tracklist;
        
        this.show = data.show;
        this.artist = data.artist;
        this.genre = data.genre;  
    }
}