import {Model} from "@mean/shared/src/models/model";
import {DeleteResult} from 'typeorm';
import {ObjectId} from "mongodb";
import {MongoRepository} from "typeorm/repository/MongoRepository";

export abstract class RestService<M extends Model> {

    protected constructor(private repository: MongoRepository<M>) {

    }

    async list(): Promise<M[]> {
        return this.repository.find();
    }

    async get(id: string): Promise<M | null> {
        let _id: ObjectId = new ObjectId(id);
        // @ts-ignore
        return this.repository.findOneBy({_id});
    }

    async create(item: M): Promise<M> {
        return this.repository.create(item);
    }

    async update(id: string, item: M): Promise<M> {
        let _id = new ObjectId(id);
        return this.repository.save({_id, ...item});

    }

    async delete(id: string): Promise<boolean> {
        let result: DeleteResult = await this.repository.delete(id);
        return !!result.affected;
    }
}