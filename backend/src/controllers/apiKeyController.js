const apiKeyService = require('../services/apiKeyService');
const { logger } = require('../config');

exports.createApiKey = async (req, res) => {
  try {
    const { label, permissions } = req.body;
    // NÂNG CẤP: Chỉ yêu cầu 'label'. 'permissions' là tùy chọn.
    if (!label) {
      return res.status(400).json({ error: 'Label is required.' });
    }
    // Đảm bảo permissions là một mảng nếu nó được cung cấp
    if (permissions && !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions must be an array.' });
    }

    const { apiKey, record } = await apiKeyService.generateApiKey(req.user.userId, label, permissions || []);
    
    res.status(201).json({
      message: "API Key generated successfully. Please save this key securely. You will not be able to see it again.",
      apiKey,
      // NÂNG CẤP: Đổi tên 'id' thành '_id' cho nhất quán với Mongoose
      record: {
          _id: record._id,
          label: record.label,
          permissions: record.permissions,
          keyHint: record.keyHint,
          lastUsedAt: record.lastUsedAt,
      }
    });
  } catch (err) {
    logger.error(`Error creating API key for user ${req.user.userId}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

exports.getApiKeys = async (req, res) => {
    try {
        const keys = await apiKeyService.getUserApiKeys(req.user.userId);
        res.json({ keys });
    } catch (err) {
        logger.error(`Error fetching API keys for user ${req.user.userId}: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteApiKey = async (req, res) => {
    try {
        await apiKeyService.deleteApiKey(req.params.id, req.user.userId);
        res.json({ message: 'API key deleted successfully.' });
    } catch (err) {
        // NÂNG CẤP: Log lỗi để dễ dàng gỡ lỗi
        logger.error(`Error deleting API key ${req.params.id} for user ${req.user.userId}: ${err.message}`);
        res.status(404).json({ error: err.message });
    }
};
