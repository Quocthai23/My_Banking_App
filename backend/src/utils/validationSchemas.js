const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string(),
  email: Joi.string().email(),
  // Add other fields that can be updated
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Add new validation schema for updating wallet
const updateWalletSchema = Joi.object({
    walletAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/),
});


module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateWalletSchema, // Export the new schema
};
