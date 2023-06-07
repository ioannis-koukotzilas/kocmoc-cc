export class Artist {
    id: string;
    slug: string;
    name: string;
    description: string;
    image: string;

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.image = data.acf.artist_image;
    }
}