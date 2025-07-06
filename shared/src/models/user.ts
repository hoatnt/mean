import { Column, Entity } from 'typeorm';
import { Model } from "./model";

@Entity()
export class User extends Model {

    @Column()
    first_name: string;

    @Column()
    middle_name: string;

    @Column()
    last_name: string;

    @Column()
    active: boolean;

    @Column()
    username: string;

    @Column()
    password: string;

}