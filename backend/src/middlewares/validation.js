const Joi = require('joi');
const { logger } = require('../config');

const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      logger.error(`Validation error: ${errorMessages.join(', ')}`);
      return res.status(400).json({ error: errorMessages });
    }

    next();
  };
};

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  referralCode: Joi.string().allow('').optional(),
});

const transferSchema = Joi.object({
  toWallet: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  amount: Joi.number().positive().required(),
});

// [THÊM MỚI] Schema để cập nhật địa chỉ ví, cần thiết cho route /users/wallet
const updateWalletSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
});

module.exports = {
  validation: validationMiddleware,
  registerSchema,
  transferSchema,
  updateWalletSchema, // Thêm schema này vào export
};

