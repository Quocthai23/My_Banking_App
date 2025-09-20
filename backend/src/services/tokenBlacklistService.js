// Một store đơn giản trong bộ nhớ để lưu các JWT đã bị blacklist.
// Trong môi trường production, nên thay thế bằng một giải pháp bền vững như Redis.
const tokenBlacklist = new Set();

/**
 * Thêm một định danh token (jti) vào blacklist.
 * @param {string} jti - JWT ID cần blacklist.
 * @param {number} exp - Timestamp hết hạn của token (tính bằng giây).
 */
const add = (jti, exp) => {
  const now = Date.now() / 1000;
  const expiresIn = exp - now;

  if (expiresIn > 0) {
    tokenBlacklist.add(jti);
    // Tự động xóa token khỏi blacklist khi nó hết hạn.
    setTimeout(() => {
      tokenBlacklist.delete(jti);
    }, expiresIn * 1000);
  }
};

/**
 * Kiểm tra xem một định danh token (jti) có trong blacklist không.
 * @param {string} jti - JWT ID cần kiểm tra.
 * @returns {boolean} - True nếu token bị blacklist, false nếu không.
 */
const has = (jti) => {
  return tokenBlacklist.has(jti);
};

module.exports = {
  add,
  has,
};
