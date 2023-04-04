import { Router } from 'express';
import userRouter from './user-router';
import carRouter from './car-router';


// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use('/users', userRouter);
baseRouter.use('/cars', carRouter);

// Export default.
export default baseRouter;



