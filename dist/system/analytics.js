

'use strict';

System.register(['aurelia-dependency-injection', 'aurelia-event-aggregator', 'aurelia-logging', 'deepmerge'], function (_export, _context) {
	"use strict";

	var inject, EventAggregator, LogManager, deepmerge, _typeof, _dec, _class, criteria, defaultOptions, delegate, Analytics;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	return {
		setters: [function (_aureliaDependencyInjection) {
			inject = _aureliaDependencyInjection.inject;
		}, function (_aureliaEventAggregator) {
			EventAggregator = _aureliaEventAggregator.EventAggregator;
		}, function (_aureliaLogging) {
			LogManager = _aureliaLogging;
		}, function (_deepmerge) {
			deepmerge = _deepmerge.default;
		}],
		execute: function () {
			_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
				return typeof obj;
			} : function (obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
			};
			criteria = {
				isElement: function isElement(e) {
					return e instanceof Element;
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
				},
				isImg: function isImg(e) {
					return criteria.isOfType(e, 'img');
				},
				isSvg: function isSvg(e) {
					return criteria.isOfType(e, 'svg') || criteria.isOfType(e.parentNode, 'svg');
				}
			};
			defaultOptions = {
				logging: {
					enabled: true
				},
				pageTracking: {
					enabled: false,
					getTitle: function getTitle(payload) {
						return payload.instruction.config.title;
					},
					getUrl: function getUrl(payload) {
						return payload.instruction.fragment;
					}
				},
				clickTracking: {
					enabled: false,
					filter: function filter(element) {
						return criteria.isAnchor(element) || criteria.isButton(element);
					}
				},
				exceptionTracking: {
					enabled: true,
					applicationName: undefined,
					applicationVersion: undefined
				}
			};

			delegate = function delegate(filter, listener) {
				return function (evt) {
					var el = evt.target;
					do {
						if (filter && !filter(el)) {
							continue;
						}
						evt.delegateTarget = el;
						listener.apply(this, arguments);
						return;
					} while (el = el.parentNode);
				};
			};

			_export('Analytics', Analytics = (_dec = inject(EventAggregator), _dec(_class = function () {
				function Analytics(eventAggregator) {
					_classCallCheck(this, Analytics);

					this._eventAggregator = eventAggregator;
					this._initialized = false;
					this._logger = LogManager.getLogger('analytics-plugin');
					this._options = defaultOptions;

					this._trackClick = this._trackClick.bind(this);
					this._trackPage = this._trackPage.bind(this);
				}

				Analytics.prototype.attach = function attach() {
					var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultOptions;

					this._options = deepmerge(defaultOptions, options);
					if (!this._initialized) {
						var errorMessage = 'Analytics must be initialized before use.';
						this._log('error', errorMessage);
						throw new Error(errorMessage);
					}

					this._attachClickTracker();
					this._attachPageTracker();
					this._attachExceptionTracker();
				};

				Analytics.prototype.init = function init(id) {
					var script = document.createElement('script');
					script.text = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" + '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' + 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)' + "})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');";
					document.querySelector('body').appendChild(script);

					window.ga = window.ga || function () {
						(ga.q = ga.q || []).push(arguments);
					};
					ga.l = +new Date();
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
						_this._trackPage(_this._options.pageTracking.getUrl(payload), _this._options.pageTracking.getTitle(payload));
					});
				};

				Analytics.prototype._attachExceptionTracker = function _attachExceptionTracker() {
					if (!this._options.exceptionTracking.enabled) {
						return;
					}

					var options = this._options;
					var existingWindowErrorCallback = window.onerror;

					window.onerror = function (errorMessage, url, lineNumber, columnNumber, errorObject) {
						if (typeof ga === 'function') {
							var exceptionDescription = void 0;
							if (errorObject != undefined && _typeof(errorObject.message) != undefined) {
								exceptionDescription = errorObject.message;
							} else {
								exceptionDescription = errorMessage;
							}

							exceptionDescription += ' @ ' + url;

							if (lineNumber != undefined && columnNumber != undefined) {
								exceptionDescription += ':' + lineNumber + ':' + columnNumber;
							}

							var exOptions = {
								exDescription: exceptionDescription,
								exFatal: false
							};

							if (options.exceptionTracking.applicationName != undefined) {
								exOptions.appName = options.exceptionTracking.applicationName;
							}
							if (options.exceptionTracking.applicationVersion != undefined) {
								exOptions.appVersion = options.exceptionTracking.applicationVersion;
							}

							ga('send', 'exception', exOptions);
						}

						if (typeof existingWindowErrorCallback === 'function') {
							return existingWindowErrorCallback(errorMessage, url, lineNumber, columnNumber, errorObject);
						}

						return false;
					};
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
					if (!evt || !evt.delegateTarget) {
						return;
					}

					var element = this._unwrap(evt.delegateTarget);
					if (!criteria.hasTrackingInfo(element)) {
						return;
					}

					var tracking = {
						category: element.getAttribute('data-analytics-category'),
						action: element.getAttribute('data-analytics-action'),
						label: element.getAttribute('data-analytics-label'),
						value: element.getAttribute('data-analytics-value')
					};

					this._log('debug', 'click: category \'' + tracking.category + '\', action \'' + tracking.action + '\', label \'' + tracking.label + '\', value \'' + tracking.value + '\'');
					ga('send', 'event', tracking.category, tracking.action, tracking.label, tracking.value);
				};

				Analytics.prototype._trackPage = function _trackPage(path, title) {
					this._log('debug', 'Tracking path = ' + path + ', title = ' + title);
					if (!this._initialized) {
						this._log('warn', "Try calling 'init()' before calling 'attach()'.");
						return;
					}

					ga('set', {
						page: path,
						title: title
					});
					ga('send', 'pageview');
				};

				Analytics.prototype._unwrap = function _unwrap(element) {
					if (criteria.isSvg(element)) {
						return criteria.isOfType(element, 'svg') ? element : element.parentNode;
					}

					return element;
				};

				return Analytics;
			}()) || _class));

			_export('Analytics', Analytics);
		}
	};
});