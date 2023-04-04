import { ICar } from '@models/car-model';
import { getRandomInt, getFakerEmailId } from '@shared/functions';
import orm from './mock-orm-car';



/**
 * Get all cars.
 * 
 * @returns 
 */
async function getAll(): Promise<ICar[]> {
    const db = await orm.openDb();
    return db.cars;
}



/**
 * Add one car.
 * 
 * @param car 
 * @returns 
 */
 async function add(car: ICar): Promise<void> {
    const db = await orm.openDb();
    car.representativeEmail = getFakerEmailId();
    db.cars.push(car);
    return orm.saveDb(db);
}



// Export default
export default {
    getAll,
    add,
} as const;
