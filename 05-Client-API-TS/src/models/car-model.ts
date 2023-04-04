
// Car schema
export interface ICar {
    docType: string;
    representativeName: string;
    representativeEmail: string;
    representativePassword: string;
    representativeRole: string;
    createdBy: string;
    createdAt: string;
    lastLogin: string;
    isActive: number;
    params: string;
}


/**
 * Get a new Car object.
 * 
 * @returns 
 */
function getNew(
        docType: string,
        representativeName: string,
        representativeEmail: string,
        representativePassword: string,
        representativeRole: string,
        createdBy: string,
        createdAt: string,
        lastLogin: string,
        isActive: number,
        params: string
    ): ICar {
    return {
        docType,
        representativeName,
        representativeEmail,
        representativePassword,
        representativeRole,
        createdBy,
        createdAt,
        lastLogin,
        isActive,
        params
    };
}


/**
 * Copy a car object.
 * 
 * @param car 
 * @returns 
 */
function copy(car: ICar): ICar {
    return {
        docType: car.docType,
        representativeName: car.representativeName,
        representativeEmail: car.representativeEmail,
        representativePassword: car.representativePassword,
        representativeRole: car.representativeRole,
        createdBy: car.createdBy,
        createdAt: car.createdAt,
        lastLogin: car.lastLogin,
        isActive: car.isActive,
        params: car.params
    }
}


// Export default
export default {
    new: getNew,
    copy,
}
