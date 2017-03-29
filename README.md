# Aurelia-Google-Analytics
An Aurelia plugin that adds Google Analytics page tracking to your application with just a small amount of configuration. Set it up once and forget about it.

This plugin was built based on [this](https://mjau-mjau.com/blog/ajax-universal-analytics/) blog post.

## Getting Started

* Install aurelia-google-analytics

```bash
jspm install aurelia-google-analytics

# or ...
npm install aurelia-google-analytics --save
```

* Use the plugin in your app's main.js:

```javascript
export function configure(aurelia) {
    aurelia.use.plugin('aurelia-google-analytics', config => {
			config.init('<Your Tracker ID>');
			config.attach({
				logging: {
					enabled: true // Set to `true` to have some log messages appear in the browser console.
				},
				pageTracking: {
					enabled: true // Set to `false` to disable in non-production environments.
				},
				clickTracking: {
					enabled: true // Set to `false` to disable in non-production environments.
				}
			});	
		});
		
    aurelia.start().then(a => a.setRoot());
}
```

In order to use the click tracking feature, each HTML element you want to track must contain a `data-analytics-category` and `data-analytics-action` attribute. `data-analytics-label` and `data-analytics-value` are supported and optional.

## Building from source

Install dependencies

```shell
npm install
```

Then

```shell
gulp build
```

The result is 3 module formats separated by folder in `dist/`.

## Dependencies

* [aurelia-dependency-injection](https://github.com/aurelia/dependency-injection)
* [aurelia-event-aggregator](https://github.com/aurelia/event-aggregator)
* [aurelia-logging](https://github.com/aurelia/logging)
* [aurelia-router](https://github.com/aurelia/router) _implicit dependency because this plugin listens to the router:navigation:success event_
* [deepmerge](https://github.com/KyleAMathews/deepmerge)

## Pull Requests

Yes, please!
