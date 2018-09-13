
'use strict';

module.exports = function secure(options) {
	options = options || {};
	return function check(req, res, next) {
		if (req.secure) {
			next();
		} else {
			var host = options.host || req.hostname;
			res.redirect('https://' + host + req.originalUrl);
		}
	};
};
