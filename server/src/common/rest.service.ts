import { DeleteResult } from 'typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm/repository/MongoRepository';
import { MongoFindManyOptions } from 'typeorm/find-options/mongodb/MongoFindManyOptions';
import { FindOptionsOrder } from 'typeorm/find-options/FindOptionsOrder';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import {Model} from "@mean/shared/src/models/model";
import {History, Change} from '@mean/shared/src/models/history';
import {StringUtils} from '@mean/shared/src/utils/string-utils';
import {TRACK_FIELDS_KEY} from '@mean/shared/src/decorators/track';
import {ITEM_TYPE} from '@mean/shared/src/decorators/item-type';
import {TIMESTAMP_FIELDS_KEY} from '@mean/shared/src/decorators/timestamp';

export type ListParams<M> = Partial<Record<keyof M, any>> & {
  page: number;
  perPage: number;
  order: string;
};

export abstract class RestService<M extends Model> {
  protected constructor(
    private EntityClass: new () => M,
    private mongoRepository: MongoRepository<M>
  ) {}

  async list(query: Partial<ListParams<M>>): Promise<[M[], number | null]> {
    const order =
      query.order &&
      ((query.order.charAt(0) === '-'
        ? {
          [query.order.substring(1)]: 'desc'
        }
        : {
          [query.order]: 'asc'
        }) as FindOptionsOrder<M>);

    const excludedKeys = ['page', 'perPage', 'order'];
    let where = {};

    Object.keys(query).forEach((key) => {
      if (!excludedKeys.includes(key) && query[key] !== undefined && query[key] !== null) {
        where[key] = query[key];
      }
    });

    if (Object.keys(where).length > 0) {
      where = correctDataTypes(where as M, this.EntityClass);
    }

    const take: number = Number(query.perPage) || 10;
    const skip: number = (Number(query.page) || 0) * take;
    if (skip === 0) {
      return this.mongoRepository.findAndCount(this.createFindOptions(where, order, skip, take));
    } else {
      return [await this.find(where, order, skip, take), null];
    }
  }

  async get(id: string): Promise<M | null> {
    let _id: ObjectId = new ObjectId(id);
    return this.mongoRepository.findOneBy({ _id });
  }

  async create(item: M): Promise<M> {
    const creating = correctDataTypes(item, this.EntityClass);
    await this.beforeCreate(creating);
    await this.beforeSave({} as M, creating);
    return this.save(creating, 'Create', {} as M);
  }

  async replace(id: string, item: M): Promise<M> {
    let _id: ObjectId = new ObjectId(id);
    return this.save({ _id, ...correctDataTypes(item, this.EntityClass) }, 'Replace');
  }

  async update(id: string, item: M): Promise<M> {
    let _id: ObjectId = new ObjectId(id);
    const current = await this.mongoRepository.findOneBy({ _id });
    const updating = correctDataTypes({ ...current, ...item }, this.EntityClass);

    return this.save(updating, 'Edit', current);
  }

  async delete(id: string): Promise<boolean> {
    let result: DeleteResult = await this.mongoRepository.delete(id);
    return !!result.affected;
  }

  async count(query: Partial<Record<keyof M, any>>): Promise<number> {
    let whereConditions = {};
    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null) {
        whereConditions[key] = query[key];
      }
    });

    if (Object.keys(whereConditions).length > 0) {
      whereConditions = correctDataTypes(whereConditions as M, this.EntityClass);
    }

    return this.mongoRepository.countBy(whereConditions);
  }

  async createMany(items: M[]): Promise<M[]> {
    const createdItems = await this.mongoRepository.save(
      await Promise.all(
        items.map(async (item) => {
          const creating = correctDataTypes(item, this.EntityClass);
          await this.beforeCreate(creating);
          await this.beforeSave({} as M, creating);
          return creating;
        })
      )
    );

    const histories = createdItems
      .map((item) => {
        const changes: Change[] = this.composeChange(item, {} as M);
        if (changes.length > 0) {
          const history = new History();
          history.action = 'Create';
          history.container = StringUtils.uniqueKey(this.EntityClass, item._id);
          return history;
        }
        return null;
      })
      .filter(Boolean);
    if (histories) {
      this.mongoRepository.manager.save(histories).then(() => {});
    }
    return createdItems;
  }

  async beforeCreate(_updating: M): Promise<void> {}

  async beforeSave(_current: M, _updating: M): Promise<void> {}

  private async save(updating: M, action: string = 'Edit', current?: M): Promise<M> {
    if (current === undefined && updating._id) {
      current = (await this.mongoRepository.findOneBy({ _id: updating._id })) || ({} as M);
    }

    await this.beforeSave({ ...current }, updating);

    const changes: Change[] = this.composeChange(updating, current);

    if (changes.length > 0) {
      const history = new History();
      history.action = action;
      history.changes = changes;

      if (updating._id) {
        history.container = StringUtils.uniqueKey(this.EntityClass, updating._id);
        return (await this.mongoRepository.manager.save([Object.assign(new this.EntityClass(), updating), history]))[0] as M;
      } else {
        const result = await this.mongoRepository.save(updating);
        history.container = StringUtils.uniqueKey(this.EntityClass, result._id);
        this.mongoRepository.manager.save([history]).then(() => {});
        return result;
      }
    }

    return this.mongoRepository.save(updating);
  }

  private composeChange(updating: M, current: M): Change[] {
    const changes: Change[] = [];
    const trackFields = Reflect.getMetadata(TRACK_FIELDS_KEY, this.EntityClass) || [];

    for (const field of trackFields) {
      const currentValue = JSON.stringify(current[field]);
      const updatingValue = JSON.stringify(updating[field]);

      if (currentValue !== updatingValue) {
        changes.push({
          _: field,
          f: currentValue,
          t: updatingValue
        });
      }
    }

    return changes;
  }

  async getByIds(ids: string[]): Promise<M[]> {
    let _ids: ObjectId[] = ids.map((id) => new ObjectId(id));
    return this.find({
      where: {
        _id: { $in: _ids }
      }
    });
  }

  async retrieveOptions(field: keyof M, query: Partial<Record<keyof M, any>>): Promise<any[]> {
    const whereConditions = {};

    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null) {
        whereConditions[key] = query[key];
      }
    });

    const filter = Object.keys(whereConditions).length > 0 ? correctDataTypes(whereConditions as M, this.EntityClass) : {};

    return this.mongoRepository.distinct(field as string, filter);
  }

  async find(where?: FindOneOptions<M>['where'] | ObjectLiteral, order?: FindOptionsOrder<M>, skip?: number, take?: number): Promise<M[]> {
    return this.mongoRepository.find(this.createFindOptions(where, order, skip, take));
  }

  private createFindOptions(
    where: FindOneOptions<M>['where'] | ObjectLiteral = {},
    order?: FindOptionsOrder<M>,
    skip?: number,
    take?: number
  ): MongoFindManyOptions<M> {
    const findOptions: MongoFindManyOptions<M> = {};

    findOptions.where = where;

    if (order) {
      findOptions.order = order;
    }

    if (skip) {
      findOptions.skip = skip;
    }
    if (take) {
      findOptions.take = take;
    }

    return findOptions;
  }
}

export function correctDataTypes<M extends Model>(entity: M, EntityClass: new () => M): M {
  const clazz = new EntityClass();
  const result = {} as M;

  const toNumber = (numberStr: string) => {
    const numValue = Number(numberStr);
    return isNaN(numValue) ? undefined : numValue;
  };

  const toBoolean = (booleanStr: string) => booleanStr.toLowerCase() === 'true' || booleanStr === '1';

  Object.getOwnPropertyNames(clazz).forEach((fieldName) => {
    const value = entity[fieldName];

    if (value !== undefined) {
      if (Array.isArray(value)) {
        const designType = Reflect.getMetadata(ITEM_TYPE, clazz, fieldName);
        const fn = designType === Number ? toNumber : designType === Boolean ? toBoolean : undefined;
        if (fn) {
          result[fieldName] = value.map((v) => (typeof v === 'string' ? fn(v) : v));
          return;
        }
      } else if (typeof value === 'string') {
        let designType = Reflect.getMetadata('design:type', clazz, fieldName);
        if (designType === Array) {
          designType = Reflect.getMetadata(ITEM_TYPE, clazz, fieldName);
        }

        if (designType === Number) {
          const numValue = toNumber(value);
          if (numValue !== undefined) {
            result[fieldName] = numValue;
            return;
          }
        } else if (designType === Boolean) {
          result[fieldName] = toBoolean(value);
          return;
        }
      }

      result[fieldName] = value;
    }
  });

  const timestampFields = Reflect.getMetadata(TIMESTAMP_FIELDS_KEY, EntityClass) || [];

  timestampFields.forEach((fieldName: string) => {
    const value = result[fieldName];
    if (value && typeof value === 'string') {
      result[fieldName] = new Date(value);
    }
  });

  return result as M;
}
