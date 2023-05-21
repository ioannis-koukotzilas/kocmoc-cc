export class Genre {
    id: string;
    name: string;
    slug: string;
    description: string;

    constructor(id: string, name: string, slug: string, description: string) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
    }
}