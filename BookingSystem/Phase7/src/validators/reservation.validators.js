import { body } from "express-validator";

export const reservationValidators = [
  body("resourceId")
    .exists()
    .withMessage("resourceId is required")
    .isInt({ min: 1 })
    .withMessage("resourceId must be a positive integer"),

  body("userId")
    .exists()
    .withMessage("userId is required")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer"),

  body("startTime")
    .exists({ checkFalsy: true })
    .withMessage("startTime is required")
    .isISO8601()
    .withMessage("startTime must be a valid date and time"),

  body("endTime")
    .exists({ checkFalsy: true })
    .withMessage("endTime is required")
    .isISO8601()
    .withMessage("endTime must be a valid date and time"),

  body("note")
    .exists({ checkFalsy: true })
    .withMessage("note is required")
    .isString()
    .withMessage("note must be a string")
    .trim()
    .matches(/^[a-zA-Z0-9äöåÄÖÅ \,\.\-]+$/)
    .withMessage("note can only contain letters, numbers, spaces and symbols ,.-")
    .isLength({ min: 5, max: 50 })
    .withMessage("note must be 5-50 characters"),

  body("status")
    .isString()
    .withMessage("status must be a string")
    .trim()
    .isIn(["active", "cancelled", "completed"])
    .withMessage("status must be 'active', 'cancelled', or 'completed'"),
];
