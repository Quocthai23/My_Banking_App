const logger = {
    info: (msg) => {
        if (['info', 'debug'].includes(process.env.LOG_LEVEL)) {
            console.log(`[INFO] ${msg}`);
        }
    },
    error: (msg) => console.error(`[ERROR] ${msg}`),
};

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`);
    let statusCode = err.statusCode || 500;

    const response = {
        success: false,
        statusCode,
        message: err.message || 'Lỗi máy chủ cục bộ',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    if (err.name === 'ValidationError') {
        statusCode = 400;
        response.statusCode = 400;
        response.message = 'Lỗi xác thực';
        response.errors = err.errors
            ? Object.values(err.errors).map((val) => val.message)
            : [];
    } else if (err.name === 'CastError') {
        statusCode = 400;
        response.statusCode = 400;
        response.message = `${err.path}: ${err.value} không hợp lệ`;
    } else if (err.code === 11000) {
        statusCode = 409;
        response.statusCode = 409;
        response.message = 'Lỗi khóa trùng lặp';
        response.errors = err.keyValue || {};
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
