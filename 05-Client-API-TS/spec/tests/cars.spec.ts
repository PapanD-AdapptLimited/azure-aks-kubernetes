import supertest from 'supertest';
import StatusCodes from 'http-status-codes';
import { SuperTest, Test, Response } from 'supertest';

import app from '@server';
import carRepo from '@repos/car-repo';
import Car, { ICar } from '@models/car-model';
import { pErr } from '@shared/functions';
import { p as carPaths } from '@routes/car-router';
import { ParamMissingError, UserNotFoundError } from '@shared/errors';

type TReqBody = string | object | undefined;


describe('car-router', () => {

    const carsPath = '/api/cars';
    const getCarsPath = `${carsPath}${carPaths.get}`;

    const { BAD_REQUEST, CREATED, OK } = StatusCodes;
    let agent: SuperTest<Test>;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });


    /***********************************************************************************
     *                                    Test Get
     **********************************************************************************/

    describe(`"GET:${getCarsPath}"`, () => {

        it(`should return a JSON object with all the cars and a status code of "${OK}" if the
            request was successful.`, (done) => {
            // Setup spy
            const cars = [
                Car.new('docType123','representativeName','representativeEmail','representativePassword','representativeRole','createdBy','createdAt','lastLogin',1,'params:')
            ];
            spyOn(carRepo, 'getAll').and.returnValue(Promise.resolve(cars));
            // Call API
            agent.get(getCarsPath)
                .end((err: Error, res: Response) => {
                    pErr(err);
                    expect(res.status).toBe(OK);
                    // Caste instance-objects to 'User' objects
                    const respCars = res.body.cars;
                    const retCars: ICar[] = respCars.map((car: ICar) => {
                        return Car.copy(car);
                    });
                    expect(retCars).toEqual(cars);
                    expect(res.body.error).toBeUndefined();
                    done();
                });
        });

        it(`should return a JSON object containing an error message and a status code of
            "${BAD_REQUEST}" if the request was unsuccessful.`, (done) => {
            // Setup spy
            const errMsg = 'Could not fetch cars.';
            spyOn(carRepo, 'getAll').and.throwError(errMsg);
            // Call API
            agent.get(getCarsPath)
                .end((err: Error, res: Response) => {
                    pErr(err);
                    console.log(res.body)
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(errMsg);
                    done();
                });
        });

    });


});
