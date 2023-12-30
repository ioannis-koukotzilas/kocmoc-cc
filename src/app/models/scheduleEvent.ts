import { Producer } from "./producer";

export class ScheduleEvent {
  summary: string;
  start: Date;
  end: Date;
  description: string;
  location: string;

  producers?: Producer[];

  constructor(data: any) {
    this.summary = data.summary;
    this.start = new Date(data.start.dateTime);
    this.end = new Date(data.end.dateTime);
    this.description = data.description;
    this.location = data.location;
  }
}