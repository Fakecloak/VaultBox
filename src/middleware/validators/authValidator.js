import { body } from 'express-validator';

export const registerValidation = [
    body('email')
    .trim()
    .isEmail()
    .withMessage('Email ID is required')
    .normalizeEmail(),
    body('password')
        .notEmpty()
        .isLength({min:8})
        .withMessage("password must be 8 character long atleast"),
]


export const loginValidation = [
    body('email')
    .trim()
    .isEmail()
    .withMessage('please enter a valid email address.')
    .normalizeEmail(),
    body('password')
        .notEmpty()
        .isLength({min:8})
        .withMessage("password must be 8 character long atleast"),
]
