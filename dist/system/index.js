System.register(['./analytics'], function (_export) {
	'use strict';

	var Analytics;

	_export('configure', configure);

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

	return {
		setters: [function (_analytics) {
			Analytics = _analytics.Analytics;
		}],
		execute: function () {}
	};
});