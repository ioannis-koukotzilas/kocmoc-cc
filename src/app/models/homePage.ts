export class HomePage {
  id: number;
  content: string;
  highlights: { 
    highlightTitle: string;
    highlightImage: {
      url: string,
      alt: string,
      caption: string,
      description: string,
      size: {
          [key: string]: string | number;
      },
  };
  }[];

  constructor(data: any) {
    this.id = data.id;
    this.content = data.content.rendered;

    this.highlights = data.acf.highlights.map((h: any ) => ({
      highlightTitle: h.highlight_title,
      highlightImage: {
        url: h.highlight_image_data.url,
        alt: h.highlight_image_data.alt,
        caption: h.highlight_image_data.caption,
        description: h.highlight_image_data.description,
        size: h.highlight_image_data.size
      }
    }));

   

  }
}
