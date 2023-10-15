export class Genre {
    id: number;
    count: number;
    slug: string;
    name: string;
    description: string;
    parent: number;

    // Not mapped
    children?: Genre[];
    episodeId: number;

    constructor(data: any) {
        this.id = data.id;
        this.count = data.count;
        this.slug = data.slug;
        this.name = data.name;
        this.description = data.description;
        this.parent = data.parent;

        this.children = [];
        this.episodeId = data.episodeId;
    }
}