export class Genre {
    id: number;
    slug: string;
    name: string;
    description: string;
    episodeId: number;

    constructor(data: any) {
        this.id = data.id;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.episodeId = data.episodeId;
    }
}