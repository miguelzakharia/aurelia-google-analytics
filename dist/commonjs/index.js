'use strict';

exports.__esModule = true;
exports.configure = configure;

var _analytics = require('./analytics');

function configure(aurelia, configCallback) {
	try {
		var instance = aurelia.container.get(_analytics.Analytics);
		if (configCallback !== undefined && typeof configCallback === 'function') {
			configCallback(instance);
		}

		aurelia.singleton(instance);
	} catch (err) {
		console.error("configure: %o", err);
	}
}