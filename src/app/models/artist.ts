import { Episode } from "./episode";

export class Artist {
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

    episodes?: Episode[]; 

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