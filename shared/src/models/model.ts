import { User } from "./user";
import {Column, Entity, ManyToOne, ObjectId, ObjectIdColumn} from "typeorm";
import Reflect from "reflect-metadata"

@Entity()
export class Model {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  created_by_id: string;

  created_by: User;

  @Column()
  updated_by_id: string;

  updated_by: User;

}

// Create a decorator to mark timestamp fields
export const TIMESTAMP_FIELDS_KEY = Symbol("timestamp");

export function Timestamp(target: any, propertyKey: string) {
  const existingFields =
    Reflect.getMetadata(TIMESTAMP_FIELDS_KEY, target.constructor) || [];
  Reflect.defineMetadata(
    TIMESTAMP_FIELDS_KEY,
    [...existingFields, propertyKey],
    target.constructor,
  );
}