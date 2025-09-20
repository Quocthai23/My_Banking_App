const apiKeyService = require('../services/apiKeyService');
const User = require('../models/User');

// Middleware xác thực sự tồn tại của khóa API
const apiKeyAuth = async (req, res, next) => {
  const providedKey = req.header('X-API-Key');
  if (!providedKey) {
    return res.status(401).json({ error: 'Unauthorized: API key is missing.' });
  }

  try {
    const keyRecord = await apiKeyService.validateApiKey(providedKey);
    if (!keyRecord) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key.' });
    }
    
    // Gắn thông tin người dùng và quyền vào request
    req.apiKey = keyRecord;
    req.user = await User.findById(keyRecord.userId).select('-password');
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error during API key validation.' });
  }
};

const hasPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.apiKey || !req.apiKey.permissions.includes(requiredPermission)) {
            return res.status(403).json({ 
                error: `Forbidden: This API key does not have the '${requiredPermission}' permission.` 
            });
        }
        next();
    };
};


module.exports = { apiKeyAuth, hasPermission };