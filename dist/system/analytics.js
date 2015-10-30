System.register(['aurelia-dependency-injection', 'aurelia-event-aggregator', 'aurelia-logging'], function (_export) {

	'use strict';

	var inject, EventAggregator, LogManager, Analytics;

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function gaTracker(id) {
		var script = document.createElement('script');
		script.text = "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" + "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," + "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" + "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');";
		document.querySelector('body').appendChild(script);

		window.ga = window.ga || function () {
			(ga.q = ga.q || []).push(arguments);
		};ga.l = +new Date();
		ga('create', id, 'auto');
		ga('send', 'pageview');
	}

	function gaTrack(path, title) {
		ga('set', { page: path, title: title });
		ga('send', 'pageview');
	}
	return {
		setters: [function (_aureliaDependencyInjection) {
			inject = _aureliaDependencyInjection.inject;
		}, function (_aureliaEventAggregator) {
			EventAggregator = _aureliaEventAggregator.EventAggregator;
		}, function (_aureliaLogging) {
			LogManager = _aureliaLogging;
		}],
		execute: function () {
			Analytics = (function () {
				function Analytics(EventAggregator) {
					_classCallCheck(this, _Analytics);

					this.eventAggregator = EventAggregator;
					this.initialized = false;
					this.logger = LogManager.getLogger('analytics');
					this.shouldLog = false;
					this.shouldTrack = false;
				}

				_createClass(Analytics, [{
					key: 'attach',
					value: function attach() {
						var _this = this;

						if (!this.initialized) {
							if (this.shouldLog) {
								this.logger.error("Analytics must be initialized before use.");
							}
							throw new Error("Analytics must be initialized before use.");
						}

						this.eventAggregator.subscribe('router:navigation:success', function (payload) {
							return _this.track(payload.instruction.fragment, payload.instruction.config.title);
						});
					}
				}, {
					key: 'enableLogging',
					value: function enableLogging(value) {
						this.shouldLog = value;
					}
				}, {
					key: 'enableTracking',
					value: function enableTracking(value) {
						this.shouldTrack = value;
					}
				}, {
					key: 'init',
					value: function init(id) {
						var tracker = arguments.length <= 1 || arguments[1] === undefined ? 'ga' : arguments[1];

						switch (tracker) {
							case 'ga':
								if (this.initialized) {
									return;
								}
								if (this.shouldTrack) {
									gaTracker(id);
									this.initialized = true;
								}
								break;
							default:
								if (this.shouldLog) {
									this.logger.warn('init: tracker \'' + tracker + '\' is not recognized');
								}
								return;
						}

						if (this.shouldTrack && this.shouldLog) {
							this.logger.debug('init: initialized tracker \'' + tracker + '\', id \'' + id + '\'');
						}
					}
				}, {
					key: 'isInitialized',
					value: function isInitialized() {
						return this.initialized;
					}
				}, {
					key: 'track',
					value: function track(path, title) {
						if (!this.shouldTrack) {
							return;
						}
						if (!this.initialized) {
							if (this.shouldLog) {
								this.logger.warn("Try calling init() before calling 'track()'.");
							}
							return;
						}

						if (this.shouldLog) {
							this.logger.debug('track: path = \'' + path + '\', title = \'' + title + '\'');
						}
						gaTrack(path, title);
					}
				}]);

				var _Analytics = Analytics;
				Analytics = inject(EventAggregator)(Analytics) || Analytics;
				return Analytics;
			})();

			_export('Analytics', Analytics);
		}
	};
});