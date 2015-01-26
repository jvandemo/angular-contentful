# AngularJS Contentful

Very lightweight AngularJS library to access Contentful resources using native AngularJS services.

Optimized for performance:

- does **NOT** require [`contenful.js`](https://github.com/contentful/contentful.js)
- does **NOT** require [`ng-contenful.js`](https://github.com/contentful/ng-contentful)

## Why not use the official contentful.js?

The official Contentful way is to include 2 scripts in your application:

```xml
<script type="text/javascript" charset="utf-8" src="bower_components/contentful/dist/contentful.min.js"></script>
<script type="text/javascript" charset="utf-8" src="bower_components/ng-contentful/ng-contentful.js"></script>
```

where `contentful.js` is the main Contentful JavaScript library that relies on different external libraries such as:

- `questor` to perform HTTP requests
- `bluebird` for promises

and then bundles everything together in `contentful.js` using Browserify, resulting in a file that packs over `100KB` minified.

The second file `ng-contenful.js` then forms a wrapper around `contentful.js` that takes care of converting the `bluebird` promises back to AngularJS promises.

This makes sense if you are in a non-AngularJS environment such as node.js, but AngularJS already has built-in services to perform HTTP requests and provide promises.

## A better alternative

This AngularJS module uses native AngularJS services to provide a similar API using:

- `$http` to perform HTTP requests
- `$q` for promises

which results in:

- **NOT** having to include `contentful.js`, saving you an expensive 100KB+ client side download when your application loads
- less CPU cycles in the client by not having to convert promises

