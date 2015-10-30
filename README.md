# Aurelia-Google-Analytics
An Aurelia plugin that adds Google Analytics page tracking to your application with just a small amount of configuration. Set it up once and forget about it.

This plugin was built based on [this](https://mjau-mjau.com/blog/ajax-universal-analytics/) blog post.

## Getting Started

* Install aurelia-google-analytics

```bash
jspm install aurelia-google-analytics

# In case the above does not work for some reason, the following will work:
# jspm install aurelia-google-analytics=github:miguelzakharia/aurelia-google-analytics
```

* Use the plugin in your app's main.js:

```javascript
export function configure(aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin('aurelia-google-analytics', config => {
			config.enableTracking(true); // Set to `false` to disable in non-production environments.
			config.enableLogging(false); // Set to `true` to have some log messages appear in the browser console.
			config.init('<your GA Tracking ID here>', 'ga');
		});

    aurelia.start().then(a => a.setRoot());
}
```

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

## Pull Requests

Yes, please!
