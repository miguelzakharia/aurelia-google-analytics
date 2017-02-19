'use strict';

System.register(['./analytics'], function (_export, _context) {
	"use strict";

	var Analytics;
	function configure(aurelia, configCallback) {
		try {
			var instance = aurelia.container.get(Analytics);
			if (configCallback !== undefined && typeof configCallback === 'function') {
				configCallback(instance);
			}

			aurelia.singleton(instance);
		} catch (err) {
			console.error("configure: %o", err);
		}
	}

	_export('configure', configure);

	return {
		setters: [function (_analytics) {
			Analytics = _analytics.Analytics;
		}],
		execute: function () {}
	};
});