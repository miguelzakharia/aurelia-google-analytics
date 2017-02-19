/**
 * analytics.js - Provides an abstraction over code that calls Google Analytics
 * for user tracking. Attaches to router:navigation:success event to track when
 * a page has been loaded. Registers a click event handler for elements that are defined
 * in the filter function to track clicks.
 */

'use strict';

import {
	inject
} from 'aurelia-dependency-injection';
import {
	EventAggregator
} from 'aurelia-event-aggregator';
import * as LogManager from 'aurelia-logging';

/*
.plugin('aurelia-google-analytics', config => {
			config.init('<Tracker ID here>');
			config.attach({
				logging: {
					enabled: true
				},
				pageTracking: {
					enabled: true
				},
				clickTracking: {
					enabled: true,
					filter: (element) => {
						return element instanceof HTMLElement &&
						(element.nodeName.toLowerCase() === 'a' ||
							element.nodeName.toLowerCase() === 'button');
					}
				}
			});
		})
*/

const defaultOptions = {
	logging: {
		enabled: true
	},
	pageTracking: {
		enabled: false
	},
	clickTracking: {
		enabled: false,
		filter: function(element) {
			return element instanceof HTMLElement &&
				(element.nodeName.toLowerCase() === 'a' ||
					element.nodeName.toLowerCase() === 'button');
		}
	}
};

const criteria = {
	isElement: function (e) {
		return e instanceof HTMLElement;
	},
	hasClass: function (cls) {
		return function (e) {
			return criteria.isElement(e) && e.classList.contains(cls);
		}
	},
	hasTrackingInfo: function (e) {
		return criteria.isElement(e) &&
			e.hasAttribute('data-analytics-category') &&
			e.hasAttribute('data-analytics-action');
	},
	isOfType: function (e, type) {
		return criteria.isElement(e) && e.nodeName.toLowerCase() === type.toLowerCase();
	},
	isAnchor: function (e) {
		return criteria.isOfType(e, 'a');
	},
	isButton: function (e) {
		return criteria.isOfType(e, 'button');
	}
};

const delegate = function (criteria, listener) {
	return function (evt) {
		let el = evt.target;
		do {
			if (criteria && !criteria(el))
				continue;
			evt.delegateTarget = el;
			listener.apply(this, arguments);
			return;
		} while ((el = el.parentNode));
	};
};

@inject(EventAggregator)
export class Analytics {
	constructor(eventAggregator) {
		this._eventAggregator = eventAggregator;
		this._initialized = false;
		this._logger = LogManager.getLogger('analytics-plugin');
		this._options = defaultOptions;

		this._trackClick = this._trackClick.bind(this);
		this._trackPage = this._trackPage.bind(this);
	}

	attach(options = defaultOptions) {
		this._options = Object.assign({}, defaultOptions, options);
		if (!this._initialized) {
			const errorMessage = "Analytics must be initialized before use.";
			this._log('error', errorMessage);
			throw new Error(errorMessage);
		}

		this._attachClickTracker();
		this._attachPageTracker();
	}

	init(id) {
		const script = document.createElement('script');
		script.text = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" +
			"(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," +
			"m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" +
			"})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');";
		document.querySelector('body').appendChild(script);

		window.ga = window.ga || function () {
			(ga.q = ga.q || []).push(arguments)
		};
		ga.l = +new Date;
		ga('create', id, 'auto');

		this._initialized = true;
	}

	_attachClickTracker() {
		if (!this._options.clickTracking.enabled) {
			return;
		}

		document.querySelector('body')
			.addEventListener('click', delegate(this._options.clickTracking.filter, this._trackClick));
	}

	_attachPageTracker() {
		if (!this._options.pageTracking.enabled) {
			return;
		}

		this._eventAggregator.subscribe('router:navigation:success',
			payload => this._trackPage(payload.instruction.fragment, payload.instruction.config.title));
	}

	_log(level, message) {
		if (!this._options.logging.enabled) {
			return;
		}

		this._logger[level](message);
	}

	_trackClick(evt) {
		if (!this._initialized) {
			this._log('warn', "The component has not been initialized. Please call 'init()' before calling 'attach()'.");
			return;
		}
		if (!evt || !evt.delegateTarget || !criteria.hasTrackingInfo(evt.delegateTarget)) {
			return
		};

		const element = evt.delegateTarget;
		const tracking = {
			category: element.getAttribute('data-analytics-category'),
			action: element.getAttribute('data-analytics-action'),
			label: element.getAttribute('data-analytics-label'),
			value: element.getAttribute('data-analytics-value')
		};

		this._log('debug', `click: category '${tracking.category}', action '${tracking.action}', label '${tracking.label}', value '${tracking.value}'`);
		ga('send', 'event', tracking.category, tracking.action, tracking.label, tracking.value);
	}

	_trackPage(path, title) {
		this._log('debug', `Tracking path = ${path}, title = ${title}`);
		if (!this._initialized) {
			this._log('warn', "Try calling 'init()' before calling 'attach()'.");
			return;
		}

		ga('set', {
			page: path,
			title: title
		});
		ga('send', 'pageview');
	}
}
