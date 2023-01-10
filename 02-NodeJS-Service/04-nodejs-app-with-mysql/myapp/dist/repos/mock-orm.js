"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonfile_1 = __importDefault(require("jsonfile"));
const dbFilePath = 'src/repos/database.json';
/**
 * Fetch the json from the file.
 *
 * @returns
 */
function openDb() {
    return jsonfile_1.default.readFile(dbFilePath);
}
/**
 * Update the file.
 *
 * @param db
 * @returns
 */
function saveDb(db) {
    return jsonfile_1.default.writeFile(dbFilePath, db);
}
// Export default
exports.default = {
    openDb,
    saveDb,
};
