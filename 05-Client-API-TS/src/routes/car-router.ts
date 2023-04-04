import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';

import carService from '@services/car-service';
import { ParamMissingError } from '@shared/errors';



// Constants
const router = Router();
const { CREATED, OK } = StatusCodes;

// Paths
export const p = {
    get: '/all',
    add: '/add',
    update: '/update',
    delete: '/delete/:id',
} as const;



/**
 * Get all cars.
 */
router.get(p.get, async (_: Request, res: Response) => {
    const cars = await carService.getAll();
    console.log(cars)
    return res.status(OK).json({cars});
});


/**
 * Add one car.
 */
router.post(p.add, async (req: Request, res: Response) => {
    const { car } = req.body;
    console.log(req.body)
    // Check param
    if (!car) {
        throw new ParamMissingError();
    }
    // Fetch data
    await carService.addOne(car);
    return res.status(CREATED).end();
});


// Export default
export default router;
