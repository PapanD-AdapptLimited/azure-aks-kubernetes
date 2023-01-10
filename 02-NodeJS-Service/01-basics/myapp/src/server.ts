import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

import express, { NextFunction, Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import apiRouter from './routes/api';
import logger from 'jet-logger';
import { CustomError } from '@shared/errors';


// Constants
const app = express();


/***********************************************************************************
 *                                  Middlewares
 **********************************************************************************/

// Common middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security (helmet recommended in express docs)
if (process.env.NODE_ENV === 'production') {
    app.use(cors({origin: '*'}));
    app.use(helmet({ crossOriginOpenerPolicy: true }));
}


/***********************************************************************************
 *                         API routes and error handling
 **********************************************************************************/

// Inbound Logging
app.use((req:Request, res:Response, next:NextFunction) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    logger.info(`${ip} ${req.method} ${req.url}`);
    if (req.method == 'POST' || req.method == 'PUT') {
        logger.info(`[Body-Payload] ${JSON.stringify(req.body)}`);
    }
    next();
});

// Add api router
app.use('/api', apiRouter);

// Error handling
app.use((err: Error | CustomError, _: Request, res: Response, __: NextFunction) => {
    logger.err(err, true);
    const status = (err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST);
    return res.status(status).json({
        error: err.message,
    });
});


/***********************************************************************************
 *                                  Front-end content
 **********************************************************************************/

// Set views dir
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static dir
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Serve index.html file
app.get('*', (_: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});



// Export here and start in a diff file (for testing).
export default app;
