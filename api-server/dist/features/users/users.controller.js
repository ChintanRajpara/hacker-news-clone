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
const users_model_1 = __importDefault(require("./users.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UsersController {
    constructor() {
        // Bind methods to the class instance
        this.signup = this.signup.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }
    static getInstance() {
        if (!UsersController.instance) {
            UsersController.instance = new UsersController();
        }
        return UsersController.instance;
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            const existingUser = yield users_model_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: "User already exists." });
                return; // You can break out early after sending the response
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield users_model_1.default.create({
                name,
                email,
                password: hashedPassword,
            });
            const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === "production",
                sameSite: "lax", // or "none" if using HTTPS
                secure: false, // true only if using HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // optional expiry
            });
            res.status(201).json({ message: "User created successfully." });
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield users_model_1.default.findOne({ email });
            if (!user) {
                res.status(400).json({ message: "Invalid credentials." });
                return;
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(400).json({ message: "Invalid credentials." });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id.toString(), email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.cookie("token", token, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === "production",
                sameSite: "lax", // or "none" if using HTTPS
                secure: false, // true only if using HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // optional expiry
            });
            res.status(200).json({ message: "Logged in successfully." });
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie("token");
            res.status(200).json({ message: "Logged out successfully." });
        });
    }
}
exports.default = UsersController.getInstance();
