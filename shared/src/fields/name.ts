import { Column } from 'typeorm';

export class NameFields {

  @Column()
  first: string;

  @Column()
  middle: string;

  @Column()
  last: string;

  getFullName(): string {
    return `${this.first} ${this.middle ? this.middle + ' ' : ''}${this.last}`;
  }
}