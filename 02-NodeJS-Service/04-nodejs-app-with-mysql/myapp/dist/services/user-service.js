"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_repo_1 = __importDefault(require("@repos/user-repo"));
const errors_1 = require("@shared/errors");
/**
 * Get all users.
 *
 * @returns
 */
function getAll() {
    return user_repo_1.default.getAll();
}
/**
 * Add one user.
 *
 * @param user
 * @returns
 */
function addOne(user) {
    return user_repo_1.default.add(user);
}
/**
 * Update one user.
 *
 * @param user
 * @returns
 */
function updateOne(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const persists = yield user_repo_1.default.persists(user.id);
        if (!persists) {
            throw new errors_1.UserNotFoundError();
        }
        return user_repo_1.default.update(user);
    });
}
/**
 * Delete a user by their id.
 *
 * @param id
 * @returns
 */
function deleteOne(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const persists = yield user_repo_1.default.persists(id);
        if (!persists) {
            throw new errors_1.UserNotFoundError();
        }
        return user_repo_1.default.delete(id);
    });
}
// Export default
exports.default = {
    getAll,
    addOne,
    updateOne,
    delete: deleteOne,
};
