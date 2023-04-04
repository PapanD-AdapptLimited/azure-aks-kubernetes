import carRepo from '@repos/car-repo';
import { ICar } from '@models/car-model';
import { UserNotFoundError } from '@shared/errors';



/**
 * Get all cars.
 * 
 * @returns 
 */
function getAll(): Promise<ICar[]> {
    return carRepo.getAll();
}

/**
 * Add one car.
 * 
 * @param car 
 * @returns 
 */
 function addOne(car: ICar): Promise<void> {
    return carRepo.add(car);
}




// Export default
export default {
    getAll,
    addOne
} as const;
