'use strict';

import {Analytics} from './analytics';

export function configure (aurelia, configCallback) {
	try {
		const instance = aurelia.container.get(Analytics);
		if (configCallback !== undefined && typeof(configCallback) === 'function') {
			configCallback(instance);
		}

		aurelia.singleton(instance);
	}
	catch(err) {
		console.error("configure: %o", err);
	}
}
