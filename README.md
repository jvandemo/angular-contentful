# AngularJS Contentful

AngularJS module to access the [Contentful](https://www.contentful.com) [content delivery API](https://www.contentful.com/developers/documentation/content-delivery-api/):

[![Build Status](https://travis-ci.org/jvandemo/angular-contentful.svg?branch=master)](https://travis-ci.org/jvandemo/angular-contentful)

- lightweight (< 2KB minified)
- no external dependencies
- uses the native AngularJS `$http` service to connect to the API
- returns native AngularJS `$q` promises

## Usage

First install the module using bower:
 
```bash
$ bower install angular-contentful
```

the add the `contentful` module to the dependencies of your AngularJS application module:

```javascript
angular.module('yourApp', ['contentful']);
```

and finally configure the `contentful` service in a config block using the provider:

```javascript
angular
  .module('yourApp')
  .config(function(contentfulProvider){
    contentfulProvider.setOptions({
      {
        space: 'yourSpace',
        accessToken: 'yourAccessToken',
      }
    });
  });
```
 
Now you can use the `contentful` service anywhere in your application:

```javascript
angular
  .module('yourApp')
  .controller('SomeCtrl', function(contentful){
    
    contentful
      .entries()
      .then(
        function(entries){
          console.log(entries);
        },
        function(){
          console.log('Oops, something went wrong');
        }
      );
    
  });
```

## API

### contentful.asset(id)

Get an asset.

##### Arguments

- **id** - {string} - Asset id, required

##### Returns

Promise.

### contentful.assets(query)

Get assets.

##### Arguments

- **query** - {string|object} - Query to pass to API, optional

##### Returns

Promise.

### contentful.contentType(id)

Get a content type.

##### Arguments

- **id** - {string} - Content type id, required

##### Returns

Promise.

### contentful.contentTypes(query)

Get content types.

##### Arguments

- **query** - {string|object} - Query to pass to API, optional

### contentful.entry(id)

Get an entry.

##### Arguments

- **id** - {string} - Entry id, required

##### Returns

Promise.

### contentful.entries(query)

Get entries.

##### Arguments

- **query** - {string|object} - Query to pass to API, optional

##### Returns

Promise.

### contentful.space()

Get space.

##### Arguments

None.

##### Returns

Promise.

## Promises

All methods return an AngularJS HttpPromise.

The `then` method takes 2 arguments: a success handler and an error handler.

Depending on the reponse of the API, either the success handler or the error handler
is called with a destructured representation of the response with the following properties:

- **data** – {string|Object} – The response body transformed with the transform functions.
- **status** – {number} – HTTP status code of the response.
- **headers** – {function([headerName])} – Header getter function.
- **config** – {Object} – The configuration object that was used to generate the request.
- **statusText** – {string} – HTTP status text of the response.

So the signature of both handlers looks like this:

`function(data, status, headers, config){}`

## Why not use the official contentful.js?

The official Contentful to way is to include 2 libraries in your application:

```xml
<script type="text/javascript" charset="utf-8" src="bower_components/contentful/dist/contentful.min.js"></script>
<script type="text/javascript" charset="utf-8" src="bower_components/ng-contentful/ng-contentful.js"></script>
```

#### The problem

`contentful.js` is the main Contentful JavaScript library that relies on different external libraries such as:

- `questor` to perform HTTP requests
- `bluebird` for promises

and then bundles everything together in `contentful.js` using Browserify, resulting in a file that packs over `100KB` minified.

`ng-contenful.js` then forms a wrapper around `contentful.js` that takes care of converting the `bluebird` promises back to AngularJS promises.

This makes sense if you are in a non-AngularJS environment such as node.js, but AngularJS already has built-in services to perform HTTP requests and provide promises.

#### The solution

This AngularJS module uses native AngularJS services to provide a similar API using:

- `$http` to perform HTTP requests
- `$q` for promises

which results in:

- **NOT** having to include `contentful.js` and `ng-contentful.js`, saving you an expensive 100KB+ client side download when your application loads
- less CPU cycles in the client by not having to convert promises

## Contribute

To update the build in the `dist` directory:

```bash
$ gulp
```

To run the unit tests using the src files:

```bash
$ gulp test-src
```

To run the unit tests using the unminified library:

```bash
$ gulp test-dist-concatenated
```

To run the unit tests using the minified library:

```bash
$ gulp test-dist-minified
```

## Change log

### v0.1.0

- Add contentful service
- Add unit tests
- Add initial documentation
