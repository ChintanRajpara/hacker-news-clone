"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
//details from the env
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;
const dbUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`;
//db connection
exports.connectDB = mongoose_1.default
    .connect(dbUrl)
    .then((res) => {
    if (res) {
        console.log(`Database connection succeffully to ${dbName}`);
    }
})
    .catch((err) => {
    logger_1.default.error(err);
    throw new Error("cannot connect to DB");
});
