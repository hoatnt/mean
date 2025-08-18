import 'reflect-metadata';

export const ITEM_TYPE = Symbol('array:itemtype');

export default function ItemType(type: any) {
  return Reflect.metadata(ITEM_TYPE, type);
}
