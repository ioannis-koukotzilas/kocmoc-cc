export class Artist {
    id: number;
    slug: string;
    name: string;
    description: string;
    image: {
        url: string,
        title: string,
        sizes: {
            [key: string]: string | number;
        }
    };

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.image = {
            url: data.image.url,
            title: data.image.title,
            sizes: data.image.sizes
        };
    }
}