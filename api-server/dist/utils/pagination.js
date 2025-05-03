"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
function encodeCursor(cursor) {
    return Buffer.from(JSON.stringify(cursor)).toString("base64");
}
function decodeCursor(cursor) {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
}
