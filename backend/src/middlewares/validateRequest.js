const { response } = require("../utils/response");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return response.validationError(res, errors[0] ?? 'Validation Error!', errors);
    }
    next();
  };
};

module.exports = validateRequest;
