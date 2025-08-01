import { Column, Entity } from 'typeorm';
import { Model } from "./model";
import {NameFields} from "../fields/name";

@Entity()
export class User extends Model {

    @Column(() => NameFields)
    name: NameFields;

    @Column()
    active: boolean;

    @Column()
    username: string;

    @Column()
    password: string;

}