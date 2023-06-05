export class Artist {
    id: string;
    slug: string;
    name: string;
    description: string;

    constructor(id: string, slug: string, name: string, description: string) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.description = description;
    }
}