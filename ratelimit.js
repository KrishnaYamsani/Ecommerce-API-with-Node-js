const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 20 * 60 * 1000, 
	max: 10,
    message: "Wait dear user,Give me time for processing and come later",
	standardHeaders: true,
	legacyHeaders: true, 
    skipFailedRequests: true
});

module.exports = limiter;