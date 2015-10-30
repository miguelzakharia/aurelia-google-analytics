'use strict';

import {Analytics} from './analytics';

export function configure (aurelia, configCallback) {
	try {
		let instance = aurelia.container.get(Analytics);
		if (configCallback !== undefined && typeof(configCallback) === 'function') {
			configCallback(instance);
		}

		if(instance.isInitialized()) {
			instance.attach();
		}
		aurelia.singleton(instance);
	}
	catch(err) {
		console.error("configure: %o", err);
	}
}
