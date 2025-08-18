import { Column, Entity } from 'typeorm';
import { Model } from './model';

export interface Change {
  _: string; // field
  f: string; // changed from
  t: string; // changed to
}

@Entity()
export class History extends Model {
  @Column('text')
  container: string;

  @Column('simple-array')
  changes: Change[];

  @Column('text')
  action: string;
}