export class Page {
  id: number;
  title: string;
  content: string;

  constructor(data: any) {
    this.id = data.id;
    this.title = data.title.rendered;
    this.content = data.content.rendered;
  }
}