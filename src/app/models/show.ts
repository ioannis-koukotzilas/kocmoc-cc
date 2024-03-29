import { Producer } from "./producer";

export class Show {
    id: number;
    slug: string;
    name: string;
    description: string;
    image: {
        url: string,
        alt: string,
        caption: string,
        description: string,
        size: {
            [key: string]: string | number;
        },
    };
    episodeId: number;

    producers?: Producer[]; 

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.image = {
            url: data.image.url,
            alt: data.image.alt,
            caption: data.image.caption,
            description: data.image.description,
            size: data.image.size,
        };
        this.episodeId = data.episodeId;
    }
}

