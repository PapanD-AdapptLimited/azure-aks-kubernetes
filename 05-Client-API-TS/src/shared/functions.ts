import logger from 'jet-logger';
import { faker } from '@faker-js/faker';

/**
 * Print an error object if it's truthy. Useful for testing.
 * 
 * @param err 
 */
export function pErr(err?: Error): void {
    if (!!err) {
        logger.err(err);
    }
};


/**
 * Get a random number between 1 and 1,000,000,000,000
 * 
 * @returns 
 */
export function getRandomInt(): number {
    return Math.floor(Math.random() * 1_000_000_000_000);
};


/**
 * Create a random email id 
 * 
 * @returns
 */
export function getFakerEmailId():string {
    // source : https://www.npmjs.com/package/@faker-js/faker
    // source : https://stackoverflow.com/questions/70697535/unable-to-set-up-the-new-faker-library
    return faker.internet.email();
}
