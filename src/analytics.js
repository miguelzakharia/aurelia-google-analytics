/**
 * analytics.js - Provides an abstraction over code that calls Google Analytics
 * for user tracking. Attaches to router:navigation:success event to track when
 * a page has been loaded.
 */

'use strict';

import {inject} from 'aurelia-dependency-injection';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as LogManager from 'aurelia-logging';

/*
.plugin('aurelia-google-analytics', config => {
			config.init('UA-69323125-1', 'ga');
			config.attach({
				logging: {
					enabled: true
				},
				pageTracking: {
					enabled: true
				},
				clickTracking: {
					enabled: true,
					filter: () => {
						return element instanceof HTMLElement &&
						(element.nodeName.toLowerCase() === 'a' ||
							element.nodeName.toLowerCase() === 'button');
					}
				}
			});
		})
*/

const defaultOptions = {
	enablePageTracking: false,
	enableClickTracking: false,
	enableLogging: false
};

const criteria = {
	isElement: function(e) { return e instanceof HTMLElement; },
	hasClass: function(cls) {
		return function(e) {
			return criteria.isElement(e) && e.classList.contains(cls);
		}
	},
	isOfType: function(e, type) {
		return criteria.isElement(e) && e.nodeName.toLowerCase() === type.toLowerCase();
	},
	isAnchor: function(e) {
		return criteria.isOfType(e, 'a');
	},
	isButton: function(e) {
		return criteria.isOfType(e, 'button');
	}
};

const delegate = function(criteria, listener) {
	return function(evt) {
		let el = evt.target;
		do {
			if(!criteria(el)) continue;
			evt.delegateTarget = el;
			listener.apply(this, arguments);
			return;
		} while( (el = el.parentNode) );
	};
};

@inject(EventAggregator)
export class Analytics {
	constructor(EventAggregator) {
		this._eventAggregator = EventAggregator;
		this._initialized = false;
		this._logger = LogManager.getLogger('analytics');
		this._options = defaultOptions;
	}

	attach(options = defaultOptions) {
		this._options = Object.assign({}, defaultOptions, options);
		const errorMessage = "Analytics must be initialized before use.";

		if(!this._initialized) {
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
			"})(window,document,'script','//www.google-analytics.com/analytics.js','ga');";
		document.querySelector('body').appendChild(script);

		window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
		ga('create', id, 'auto');
		ga('send', 'pageview');

		this._initialized = true;
	}

	isInitialized() {
		return this._initialized;
	}

	_attachClickTracker() {
		if(!this._options.enableClickTracking) { return; }


	}

	_attachPageTracker() {
		if(!this._options.enablePageTracking) { return; }

		this._eventAggregator.subscribe('router:navigation:success',
			payload => this._trackPage(payload.instruction.fragment, payload.instruction.config.title));
	}

	_log(level, message) {
		if(!this._options.enableLogging) { return; }

		this._logger[level](message);
	}

	_trackClick(evt) {
		if(!evt || !evt.delegateTarget || !criteria.hasTrackingInfo(evt.delegateTarget)) { return };

		let element = evt.delegateTarget;
		let tracking = {
			category: element.getAttribute('data-analytics-category'),
			action: element.getAttribute('data-analytics-action'),
			label: element.getAttribute('data-analytics-label')
		};

		ga('send', 'event', tracking.category, tracking.action, tracking.label);
	}

	_trackPage(path, title) {
		if(!this.shouldTrack) { return; }
		if(!this._initialized) {
			this._log('warn', "Try calling 'init()' before calling 'track()'.");
			return;
		}

		ga('set', { page: path, title: title });
		ga('send', 'pageview');

		this._log('debug', `track: path = '${path}', title = '${title}'`); 
	}
}
