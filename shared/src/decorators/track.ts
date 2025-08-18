import 'reflect-metadata';

export const TRACK_FIELDS_KEY = Symbol('track');

export default function Track(target: any, propertyKey: string) {
  const existingFields = Reflect.getMetadata(TRACK_FIELDS_KEY, target.constructor) || [];
  Reflect.defineMetadata(TRACK_FIELDS_KEY, [...existingFields, propertyKey], target.constructor);
}
