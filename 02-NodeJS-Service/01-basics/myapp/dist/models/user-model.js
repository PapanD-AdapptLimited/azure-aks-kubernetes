"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get a new User object.
 *
 * @returns
 */
function getNew(name, email) {
    return {
        id: -1,
        email,
        name,
    };
}
/**
 * Copy a user object.
 *
 * @param user
 * @returns
 */
function copy(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
    };
}
// Export default
exports.default = {
    new: getNew,
    copy,
};
