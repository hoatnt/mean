import { In, DeleteResult, FindOptionsOrder } from "typeorm";
import { ObjectId } from "mongodb";
import { MongoRepository } from "typeorm/repository/MongoRepository";
import { MongoFindManyOptions } from "typeorm/find-options/mongodb/MongoFindManyOptions";
import {Model, TIMESTAMP_FIELDS_KEY} from "@mean/shared/src/models/model";

export type ListParams<M> = {
    [key in keyof M]: any;
} & {
    page: number;
    perPage: number;
    order: string;
};

export abstract class RestService<M extends Model> {
    protected constructor(
      private EntityClass: new () => M,
      private mongoRepository: MongoRepository<M>,
    ) {}

    async list(query: ListParams<M>): Promise<[M[], number | null]> {
        const take: number = Number(query.perPage) || 10;
        const skip: number = (Number(query.page) || 0) * take;

        const findOptions: MongoFindManyOptions<M> = {
            skip,
            take,
        };

        if (query.order) {
            findOptions.order = (
              query.order.charAt(0) === "-"
                ? {
                    [query.order.substring(1)]: "desc",
                }
                : {
                    [query.order]: "asc",
                }
            ) as FindOptionsOrder<M>;
        }

        const whereConditions = buildWhereClause(query);

        if (Object.keys(whereConditions).length > 0) {
            findOptions.where = correctDataTypes(
              whereConditions as M,
              this.EntityClass,
            );
        }

        if (skip === 0) {
            return this.mongoRepository.findAndCount(findOptions);
        } else {
            return [await this.mongoRepository.find(findOptions), null];
        }
    }

    async get(id: string): Promise<M | null> {
        let _id: ObjectId = new ObjectId(id);
        return this.mongoRepository.findOneBy({ _id });
    }

    async create(item: M): Promise<M> {
        return this.mongoRepository.save(correctDataTypes(item, this.EntityClass));
    }

    async beforeSave(current: M, updating: M): Promise<void> {}

    async replace(id: string, item: M): Promise<M> {
        let _id: ObjectId = new ObjectId(id);
        const current = await this.mongoRepository.findOneBy({ _id });
        const updating = correctDataTypes(item, this.EntityClass);

        await this.beforeSave(current, updating);

        const doc = this.mongoRepository.create({ _id, ...updating });
        await this.mongoRepository.replaceOne(
          {
              _id,
          },
          doc,
        );
        return doc;
    }

    async update(id: string, item: M): Promise<M> {
        let _id: ObjectId = new ObjectId(id);
        const current = await this.mongoRepository.findOneBy({ _id });
        const updating = correctDataTypes(
          { ...current, ...item },
          this.EntityClass,
        );

        await this.beforeSave(current, updating);

        return this.mongoRepository.save(updating);
    }

    async delete(id: string): Promise<boolean> {
        let result: DeleteResult = await this.mongoRepository.delete(id);
        return !!result.affected;
    }

    async getByIds(ids: string[]): Promise<M[]> {
        let _ids: ObjectId[] = ids.map((id) => new ObjectId(id));
        return this.mongoRepository.find({
            where: {
                _id: { $in: _ids },
            },
        });
    }
}

function buildWhereClause(query: { [key: string]: any }): { [key: string]: any } {
    const whereClause: { [key: string]: any } = {};

    const excludedKeys = ["page", "perPage", "order"];
    for (const key in query) {
        if (!excludedKeys.includes(key) && query[key] !== undefined && query[key] !== null
          && Object.prototype.hasOwnProperty.call(query, key)) {
            const value = query[key];
            const parts = key.split('.');

            let currentLevel = whereClause;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (i === parts.length - 1) {
                    currentLevel[part] = value;
                } else {
                    if (!currentLevel[part] || typeof currentLevel[part] !== 'object') {
                        currentLevel[part] = {};
                    }
                    currentLevel = currentLevel[part];
                }
            }
        }
    }
    return whereClause;
}

export function correctDataTypes<T extends Model>(
  entity: T,
  EntityClass: new () => T,
): T {
    const instance = new EntityClass();

    Object.getOwnPropertyNames(entity).forEach((fieldName) => {
        const value = entity[fieldName];
        if (typeof value === "string") {
            const designType = Reflect.getMetadata(
              "design:type",
              instance,
              fieldName,
            );

            if (!designType) return;
            if (designType === Number) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    entity[fieldName] = numValue;
                }
            } else if (designType === Boolean) {
                entity[fieldName] = value.toLowerCase() === "true" || value === "1";
            }
        }
    });

    const timestampFields =
      Reflect.getMetadata(TIMESTAMP_FIELDS_KEY, EntityClass) || [];

    timestampFields.forEach((fieldName: string) => {
        const value = entity[fieldName];
        if (value && typeof value === "string") {
            entity[fieldName] = new Date(value);
        }
    });

    return entity as T;
}