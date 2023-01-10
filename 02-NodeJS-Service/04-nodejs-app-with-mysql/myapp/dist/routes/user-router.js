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
exports.p = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const express_1 = require("express");
const user_service_1 = __importDefault(require("@services/user-service"));
const errors_1 = require("@shared/errors");
// Constants
const router = (0, express_1.Router)();
const { CREATED, OK } = http_status_codes_1.default;
// Paths
exports.p = {
    get: '/all',
    add: '/add',
    update: '/update',
    delete: '/delete/:id',
};
/**
 * Get all users.
 */
router.get(exports.p.get, (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_service_1.default.getAll();
    return res.status(OK).json({ users });
}));
/**
 * Add one user.
 */
router.post(exports.p.add, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    // Check param
    if (!user) {
        throw new errors_1.ParamMissingError();
    }
    // Fetch data
    yield user_service_1.default.addOne(user);
    return res.status(CREATED).end();
}));
/**
 * Update one user.
 */
router.put(exports.p.update, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    // Check param
    if (!user) {
        throw new errors_1.ParamMissingError();
    }
    // Fetch data
    yield user_service_1.default.updateOne(user);
    return res.status(OK).end();
}));
/**
 * Delete one user.
 */
router.delete(exports.p.delete, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Check param
    if (!id) {
        throw new errors_1.ParamMissingError();
    }
    // Fetch data
    yield user_service_1.default.delete(Number(id));
    return res.status(OK).end();
}));
// Export default
exports.default = router;
