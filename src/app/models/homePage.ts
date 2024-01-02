export class HomePage {
  id: number;
  content: string;
  highlights: {
    title: string;
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
    link: string;
    linkType: string;
  }[];

  constructor(data: any) {
    this.id = data.id;
    this.content = data.content.rendered;
    this.highlights = data.acf.highlights.map((data: any) => ({
      title: data.highlight_title,
      description: data.highlight_description,
      image: {
        url: data.highlight_image_data.url,
        alt: data.highlight_image_data.alt,
        caption: data.highlight_image_data.caption,
        description: data.highlight_image_data.description,
        size: data.highlight_image_data.size
      },
      link: data.highlight_link,
      linkType: data.highlight_link_type
    }));
  }
}
