const Joi = require("joi");

// Register schema
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("password")) // must match password
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
    }),
});

module.exports = { registerSchema };
