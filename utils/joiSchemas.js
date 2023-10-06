import Joi from 'joi';

export const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: Joi.string().required(),
});

export const registerValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: Joi.string().min(6).required(),
});
