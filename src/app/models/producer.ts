import { Episode } from "./episode";
import { Show } from "./show";

export class Producer {
    id: number;
    slug: string;
    name: string;
    description: string;
    producerType: string;
    producerStatus: string;
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

    shows?: Show[]; 

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.producerType = data.acf.producer_type;
        this.producerStatus = data.acf.producer_status;
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