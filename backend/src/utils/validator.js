import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).max(100).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const uploadFileSchema = Joi.object({
  isPublic: Joi.boolean().optional(),
  expiresIn: Joi.number().integer().min(1).optional(), // days
  metadata: Joi.object().optional(),
});

export const updatePlanSchema = Joi.object({
  plan: Joi.string().valid('free', 'pro', 'enterprise').required(),
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    req.validatedBody = value;
    next();
  };
};

export default {
  registerSchema,
  loginSchema,
  uploadFileSchema,
  updatePlanSchema,
  validate,
};
