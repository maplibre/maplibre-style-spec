import {getOwn} from './get_own';

export function hasOwn<T extends object>(object: T, key: PropertyKey): key is keyof T {
    return !!getOwn(object, key);
}
