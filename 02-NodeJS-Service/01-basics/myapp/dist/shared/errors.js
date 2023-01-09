"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotFoundError = exports.ParamMissingError = exports.CustomError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class CustomError extends Error {
    constructor(msg, httpStatus) {
        super(msg);
        this.HttpStatus = http_status_codes_1.default.BAD_REQUEST;
        this.HttpStatus = httpStatus;
    }
}
exports.CustomError = CustomError;
class ParamMissingError extends CustomError {
    constructor() {
        super(ParamMissingError.Msg, ParamMissingError.HttpStatus);
    }
}
exports.ParamMissingError = ParamMissingError;
ParamMissingError.Msg = 'One or more of the required parameters was missing.';
ParamMissingError.HttpStatus = http_status_codes_1.default.BAD_REQUEST;
class UserNotFoundError extends CustomError {
    constructor() {
        super(UserNotFoundError.Msg, UserNotFoundError.HttpStatus);
    }
}
exports.UserNotFoundError = UserNotFoundError;
UserNotFoundError.Msg = 'A user with the given id does not exists in the database.';
UserNotFoundError.HttpStatus = http_status_codes_1.default.NOT_FOUND;
