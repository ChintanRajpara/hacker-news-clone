"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
class UserService {
    constructor() { }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
}
exports.userService = UserService.getInstance();
