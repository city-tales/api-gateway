import { express } from "../config/imports.js";

/**
 * Creates and returns a new Express router instance
 * @returns {import('express').Router} A new Express router instance
 */
const createRouter = () => {
    return express.Router();
};

export {
    createRouter
};