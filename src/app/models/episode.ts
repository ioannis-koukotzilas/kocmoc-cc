import { Artist } from "./artist";
import { Genre } from "./genre";
import { Producer } from "./producer";
import { Show } from "./show";
import { Tracklist } from "./tracklist";

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
    track: string;
    location: string;

    producer: number[];
    show: number[];
    genre: number[];
    artist: number[];

    producers?: Producer[]; 
    shows?: Show[]; 
    artists?: Artist[]; 
    genres?: Genre[];
    tracklists?: Tracklist[];

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.date = data.date;
        this.title = data.acf.title;
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
        this.producer = data.producer;
        this.show = data.show;
        this.genre = data.genre;
        this.artist = data.artist;
    }
}