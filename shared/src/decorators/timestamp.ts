import 'reflect-metadata';

export const TIMESTAMP_FIELDS_KEY = Symbol('timestamp');

export default function Timestamp(target: any, propertyKey: string) {
  const existingFields = Reflect.getMetadata(TIMESTAMP_FIELDS_KEY, target.constructor) || [];
  Reflect.defineMetadata(TIMESTAMP_FIELDS_KEY, [...existingFields, propertyKey], target.constructor);
}
