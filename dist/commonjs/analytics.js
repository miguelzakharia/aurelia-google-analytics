

'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _aureliaEventAggregator = require('aurelia-event-aggregator');

var _aureliaLogging = require('aurelia-logging');

var LogManager = _interopRequireWildcard(_aureliaLogging);

var defaultOptions = {
	logging: {
		enabled: true
	},
	pageTracking: {
		enabled: false
	},
	clickTracking: {
		enabled: false,
		filter: function filter(element) {
			return element instanceof HTMLElement && (element.nodeName.toLowerCase() === 'a' || element.nodeName.toLowerCase() === 'button');
		}
	}
};

var criteria = {
	isElement: function isElement(e) {
		return e instanceof HTMLElement;
	},
	hasClass: function hasClass(cls) {
		return function (e) {
			return criteria.isElement(e) && e.classList.contains(cls);
		};
	},
	hasTrackingInfo: function hasTrackingInfo(e) {
		return criteria.isElement(e) && e.hasAttribute('data-analytics-category') && e.hasAttribute('data-analytics-action');
	},
	isOfType: function isOfType(e, type) {
		return criteria.isElement(e) && e.nodeName.toLowerCase() === type.toLowerCase();
	},
	isAnchor: function isAnchor(e) {
		return criteria.isOfType(e, 'a');
	},
	isButton: function isButton(e) {
		return criteria.isOfType(e, 'button');
	}
};

var delegate = function delegate(criteria, listener) {
	return function (evt) {
		var el = evt.target;
		do {
			if (criteria && !criteria(el)) continue;
			evt.delegateTarget = el;
			listener.apply(this, arguments);
			return;
		} while (el = el.parentNode);
	};
};

var Analytics = (function () {
	function Analytics(eventAggregator) {
		_classCallCheck(this, _Analytics);

		this._eventAggregator = eventAggregator;
		this._initialized = false;
		this._logger = LogManager.getLogger('analytics-plugin');
		this._options = defaultOptions;

		this._trackClick = this._trackClick.bind(this);
		this._trackPage = this._trackPage.bind(this);
	}

	Analytics.prototype.attach = function attach() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? defaultOptions : arguments[0];

		this._options = Object.assign({}, defaultOptions, options);
		if (!this._initialized) {
			var errorMessage = "Analytics must be initialized before use.";
			this._log('error', errorMessage);
			throw new Error(errorMessage);
		}

		this._attachClickTracker();
		this._attachPageTracker();
	};

	Analytics.prototype.init = function init(id) {
		var script = document.createElement('script');
		script.text = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" + "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," + "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" + "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');";
		document.querySelector('body').appendChild(script);

		window.ga = window.ga || function () {
			(ga.q = ga.q || []).push(arguments);
		};ga.l = +new Date();
		ga('create', id, 'auto');

		this._initialized = true;
	};

	Analytics.prototype._attachClickTracker = function _attachClickTracker() {
		if (!this._options.clickTracking.enabled) {
			return;
		}

		document.querySelector('body').addEventListener('click', delegate(this._options.clickTracking.filter, this._trackClick));
	};

	Analytics.prototype._attachPageTracker = function _attachPageTracker() {
		var _this = this;

		if (!this._options.pageTracking.enabled) {
			return;
		}

		this._eventAggregator.subscribe('router:navigation:success', function (payload) {
			return _this._trackPage(payload.instruction.fragment, payload.instruction.config.title);
		});
	};

	Analytics.prototype._log = function _log(level, message) {
		if (!this._options.logging.enabled) {
			return;
		}

		this._logger[level](message);
	};

	Analytics.prototype._trackClick = function _trackClick(evt) {
		if (!this._initialized) {
			this._log('warn', "The component has not been initialized. Please call 'init()' before calling 'attach()'.");
			return;
		}
		if (!evt || !evt.delegateTarget || !criteria.hasTrackingInfo(evt.delegateTarget)) {
			return;
		};

		var element = evt.delegateTarget;
		var tracking = {
			category: element.getAttribute('data-analytics-category'),
			action: element.getAttribute('data-analytics-action'),
			label: element.getAttribute('data-analytics-label')
		};

		this._log('debug', 'click: category \'' + tracking.category + '\', action \'' + tracking.action + '\', label \'' + tracking.label + '\'');
		ga('send', 'event', tracking.category, tracking.action, tracking.label);
	};

	Analytics.prototype._trackPage = function _trackPage(path, title) {
		this._log('debug', 'Tracking path = ' + path + ', title = ' + title);
		if (!this._initialized) {
			this._log('warn', "Try calling 'init()' before calling 'attach()'.");
			return;
		}

		ga('set', { page: path, title: title });
		ga('send', 'pageview');
	};

	var _Analytics = Analytics;
	Analytics = _aureliaDependencyInjection.inject(_aureliaEventAggregator.EventAggregator)(Analytics) || Analytics;
	return Analytics;
})();

exports.Analytics = Analytics;