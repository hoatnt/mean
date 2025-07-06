import { User } from "./user";
import {Column, Entity, ManyToOne, ObjectId, ObjectIdColumn} from "typeorm";

@Entity()
export class Model {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @ManyToOne(() => User)
  created_by: User;

  @ManyToOne(() => User)
  updated_by: User;

}