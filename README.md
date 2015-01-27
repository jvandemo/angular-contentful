# AngularJS Contentful

AngularJS module to access the [Contentful](https://www.contentful.com) [content delivery API](https://www.contentful.com/developers/documentation/content-delivery-api/):

[![Build Status](https://travis-ci.org/jvandemo/angular-contentful.svg?branch=master)](https://travis-ci.org/jvandemo/angular-contentful)

- lightweight (< 3KB minified)
- no external dependencies
- uses the native AngularJS `$http` service to connect to the API
- returns native AngularJS `$q` promises

## Demo

There are working demo's available in the [examples](examples) directory.

## Usage

First install the module using bower:
 
```bash
$ bower install angular-contentful
```

and add the library to your application:

```xml
<script type="text/javascript" charset="utf-8" src="bower_components/angular-contentful/dist/angular-contentful.min.js"></script>
```

Then add the `contentful` module to the dependencies of your AngularJS application module:

```javascript
angular.module('yourApp', ['contentful']);
```

and configure the `contentful` service in a config block using the provider:

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
 
Now you can use one of the directives to fetch Contentful data right from within your markup:

```xml
<pre contentful-entry="6KntaYXaHSyIw8M6eo26OK">
  {{$contentfulEntry.entry | json}}
</pre>
```
 
or you can use the `contentful` service anywhere in your application code:

```javascript
angular
  .module('yourApp')
  .controller('SomeCtrl', function(contentful){
    
    // Get all entries
    contentful
      .entries()
      .then(
      
        // Success handler
        function(response){
          var entries = response.data;
          console.log(entries);
        },
        
        // Error handler
        function(response){
          console.log('Oops, error ' + response.status);
        }
      );
    
  });
```

## The contentful-entry directive

Fetches a contentful entry asynchronously in the background and makes it available in your child markup as `$contentfulEntry.entry` as soon as a response from Contentful is received.

For example, to display an entire entry with id `6KntaYXaHSyIw8M6eo26OK`:

```xml
<pre contentful-entry="6KntaYXaHSyIw8M6eo26OK">
  {{$contentfulEntry.entry | json}}
</pre>
```

Or to display only one field of the entry:

```xml
<h1 contentful-entry="6KntaYXaHSyIw8M6eo26OK">
  Hi {{$contentfulEntry.entry.fields.name}}!
</h1>
```

The `$contentfulEntry` controller is available in the child elements as well:

```xml
<article contentful-entry="6KntaYXaHSyIw8M6eo26OK">
  <section>
    {{$contentfulEntry.entry.fields.sectionOne}}
  </section>
  <section>
    {{$contentfulEntry.entry.fields.sectionTwo}}
  </section>
<article>
```

## The contentful-entries directive

Fetches multiple contentful entries asynchronously in the background and makes them available in your child markup as `$contentfulEntries.entries` as soon as a response from Contentful is received.

For example, to fetch all entries in your space:

```xml
<ul contentful-entries>
  <li ng-repeat="entry in $contentfulEntries.entries">
    {{entry.fields.name}}
  </li>
</pre>
```

Or specify a query string to filter the entries:

```xml
<ul contentful-entries="content_type=dog">
  <li ng-repeat="entry in $contentfulEntries.entries">
    {{entry.fields.name}}
  </li>
</pre>
```

The query string is passed to the contentful API, so you can use all [supported filters](https://www.contentful.com/developers/documentation/content-management-api/#search-filter).

## The contentful service

The `contentful` service can be injected anywhere in your application and exposes the following API:

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

##### Returns

Promise.

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

Similar to AngularJS HTTP requests, all methods return an original AngularJS HttpPromise.

The `then` method takes 2 arguments: a success handler and an error handler.

Depending on the reponse of the API, either the success handler or the error handler
is called with a destructured representation of the response with the following properties:

- **data** – {string|Object} – The response body transformed with the transform functions.
- **status** – {number} – HTTP status code of the response.
- **headers** – {function([headerName])} – Header getter function.
- **config** – {Object} – The configuration object that was used to generate the request.
- **statusText** – {string} – HTTP status text of the response.

```javascript
contentful
  .entries()
  .then(
  
    // Success handler
    function(response){
      var entries = response.data;
      console.log(entries);
    },
    
    // Error handler
    function(response){
      console.log('Oops, error ' + response.status);
    }
  );
```

You can also use the AngularJS shorthand `success` and `error` methods if you conveniently want the properties to be available as arguments:

```javascript
contentful
  .entries()
  
  // Success handler
  .success(function(data, status, headers, config){
     var entries = data;
     console.log(entries);
  })
  
  // Error handler
  .error(function(data, status, headers, config){
    console.log('Oops, error ' + status);
  });
```

#### Example response for successful request

```javascript
{
  "data": {
    "sys": {
      "type": "Space",
      "id": "cfexampleapi"
    },
    "name": "Contentful Example API",
    "locales": [
      {
        "code": "en-US",
        "default": true,
        "name": "English"
      },
      {
        "code": "tlh",
        "default": false,
        "name": "Klingon"
      }
    ]
  },
  "status": 200,
  "config": {
    "method": "GET",
    "transformRequest": [
      null
    ],
    "transformResponse": [
      null
    ],
    "headers": {
      "Accept": "application/json, text/plain, */*"
    },
    "params": {
      "access_token": "b4c0n73n7fu1"
    },
    "url": "https://cdn.contentful.com:443/spaces/cfexampleapi"
  },
  "statusText": "OK"
}
```

#### Example response for error

```javascript
{
  "data": {
    "sys": {
      "type": "Error",
      "id": "NotFound"
    },
    "message": "The resource could not be found.",
    "details": {
      "sys": {
        "type": "Space"
      }
    },
    "requestId": "71a-1131131513"
  },
  "status": 404,
  "config": {
    "method": "GET",
    "transformRequest": [
      null
    ],
    "transformResponse": [
      null
    ],
    "headers": {
      "Accept": "application/json, text/plain, */*"
    },
    "params": {
      "access_token": "b4c0n73n7fu1"
    },
    "url": "https://cdn.contentful.com:443/spaces/cfexampleapiii"
  },
  "statusText": "Not Found"
}
```

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

### v0.4.0

- Added contentfulEntries directive
- Added additional unit tests
- Updated documentation

### v0.3.0

- Added contentfulEntry directive
- Added additional unit tests
- Updated documentation

### v0.2.0

- Added demo application
- Added shorthand support for `success` and `error` handlers
- Added documentation

### v0.1.0

- Added contentful service
- Added unit tests
- Added initial documentation
