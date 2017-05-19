# AngularJS Contentful

AngularJS module to easily access the [Contentful](https://www.contentful.com) [content delivery API](https://www.contentful.com/developers/documentation/content-delivery-api/):

![angular-contentful](https://cloud.githubusercontent.com/assets/1859381/10281579/b8b29e38-6b75-11e5-8975-7732c9533487.png)

[![Build Status](https://travis-ci.org/jvandemo/angular-contentful.svg?branch=master)](https://travis-ci.org/jvandemo/angular-contentful)

- lightweight (< 3KB minified)
- no external dependencies
- automatically resolves linked content in the response for maximum convenience
- uses the native AngularJS `$http` service to connect to the API
- returns native AngularJS `$q` promises

## Demo

There are working demo's available in the [examples](examples) directory.

## Usage

First install the module using bower:
 
```bash
$ bower install angular-contentful
```

or npm:

```bash
$ npm install angular-contentful
```

and add the library to your application:

```xml
<script type="text/javascript" charset="utf-8" src="bower_components/angular-contentful/dist/angular-contentful.min.js"></script>
```

> The `src` attribute value above is an example when using `bower`. Your local library path may vary depending on whether you used `bower` or `npm` as your installation method and whether or not you have a build process in place.

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
        space: 'yourSpace',
        accessToken: 'yourAccessToken'
    });
  });
```
 
Now you can use one of the directives to fetch Contentful data right from within your markup:

```xml
<pre contentful-entry="'6KntaYXaHSyIw8M6eo26OK'">
  {{ $contentfulEntry | json }}
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

Fetches a Contentful entry asynchronously in the background and makes it available in your child markup as `$contentfulEntry` as soon as a response from Contentful is received.

Requires a Contentful entry id or a query string to be passed.

#### Fetch an entry by id

To display an entire entry with id *6KntaYXaHSyIw8M6eo26OK*:

```xml
<!-- use an Angular expression -->
<pre contentful-entry="entryId">
  {{ $contentfulEntry | json }}
</pre>

<!-- use a literal string, notice the single quotes -->
<pre contentful-entry="'6KntaYXaHSyIw8M6eo26OK'">
  {{ $contentfulEntry | json }}
</pre>
```

Or to display only one field of the entry:

```xml
<h1 contentful-entry="'6KntaYXaHSyIw8M6eo26OK'">
  Hi {{ $contentfulEntry.fields.name }}!
</h1>
```

`$contentfulEntry` is available in the child elements as well:

```xml
<article contentful-entry="'6KntaYXaHSyIw8M6eo26OK'">
  <section>
    {{ $contentfulEntry.fields.sectionOne }}
  </section>
  <section>
    {{ $contentfulEntry.fields.sectionTwo }}
  </section>
<article>
```

To make Contentful resolve the linked content in the entry, use [include](https://www.contentful.com/developers/documentation/content-delivery-api/#search-link):

```xml
<pre contentful-entry="'sys.id=6KntaYXaHSyIw8M6eo26OK&include=3'">
  {{ $contentfulEntry | json }}
</pre>
```

to specify the number of levels of linked entries to resolve.

#### Fetch an entry by query string

Often you want to fetch an entry by a property other than `sys.id`.

Therefore the directive also allows you to specify a query string instead of an id like this:

```xml
<h1 contentful-entry="'content_type=dog&fields.slug=bob'">
  Hi {{ $contentfulEntry.fields.name }}!
</h1>
```

**Notice**

Behind the scenes all entries matching your query will be fetched and the first item will be assigned to `$contentfulEntry`.

To reduce data traffic it is highly recommended to use a query string that results in only one entry or add a `limit=1` statement to your query like this:

```xml
<h1 contentful-entry="'content_type=dog&order=fields.age&limit=1'">
  Hi {{ $contentfulEntry.fields.name }}!
</h1>
```

## The contentful-entries directive

Fetches multiple Contentful entries asynchronously in the background and makes them available in your child markup as `$contentfulEntries` as soon as a response from Contentful is received.

Takes an optional query string value to pass to the Contentful content delivery API.

For example, to fetch all entries in your space:

```xml
<ul contentful-entries>
  <li ng-repeat="entry in $contentfulEntries.items">
    {{ entry.fields.name }}
  </li>
</ul>
```

Or specify a query string to filter the entries:

```xml
<!-- use an Angular expression -->
<ul contentful-entries="querystring">
  <li ng-repeat="dog in $contentfulEntries.items">
    {{ dog.fields.name }}
  </li>
</ul>

<!-- use a literal string, notice the single quotes -->
<ul contentful-entries="'content_type=dog'">
  <li ng-repeat="dog in $contentfulEntries.items">
    {{ dog.fields.name }}
  </li>
</ul>
```

The optional query string is passed to the Contentful API, so you can use all [supported filters](https://www.contentful.com/developers/documentation/content-management-api/#search-filter).

Links are automatically resolved too, so you can easily access linked content as embedded data like this:

```xml
<ul contentful-entries="'content_type=dog'">
  <li ng-repeat="dog in $contentfulEntries.items | orderBy:'fields.name' ">
    <h1>{{ dog.fields.name }}</h2>
    <img ng-src="{{ dog.fields.image.fields.file.url }}" />
  </li>
</ul>
```

## The contentful service

The `contentful` service can be injected anywhere in your application and exposes the following API:

### contentful.asset(id, optionSet)

Get an asset.

##### Arguments

- **id** - {string} - Asset id, required
- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.asset(id, 'another');
// or you can pass 'default', although it will implicitly use this key
contentful.asset(id, 'default');
```

##### Returns

Promise.

### contentful.assets(queryString, optionSet)

Get assets.

##### Arguments

- **queryString** - {string} - Query string to pass to API, optional
- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.assets(queryString, 'another');
// or you can pass 'default', although it will implicitly use this key
contentful.assets(queryString, 'default');
```

##### Returns

Promise.

### contentful.contentType(id, optionSet)

Get a content type.

##### Arguments

- **id** - {string} - Content type id, required
- **optionSet** - {string} - optional - Contentful space options (one of keys passed to setOptions method of provider). If not passed it will use `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.contentType(id, 'another');
// or you can pass 'default', although it will implicitly use this key
contentful.contentType(id, 'default');
```

##### Returns

Promise.

### contentful.contentTypes(queryString, optionSet)

Get content types.

##### Arguments

- **queryString** - {string} - Query string to pass to API, optional
- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.contentTypes(queryString, 'another');
// or you can pass 'default', although it will implicitly use this key if parameter is omitted
contentful.contentTypes(queryString, 'default');
```

##### Returns

Promise.

### contentful.entry(id, optionSet)

Get an entry.

##### Arguments

- **id** - {string} - Entry id, required
- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.entry(id, 'another');
// or you can pass 'default', although it will implicitly use this key if parameter is omitted
contentful.entry(id, 'default');
```

##### Returns

Promise.

### contentful.entries(queryString, optionSet)

Get entries.

##### Arguments

- **queryString** - {string} - Query string to pass to API, optional
- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.entries(queryString, 'another');
// or you can pass 'default', although it will implicitly use this key if parameter is omitted
contentful.entries(queryString, 'default');
```

##### Returns

Promise.

### contentful.space(optionSet)

Get space.

##### Arguments

- **optionSet** - {string} - optional - Contentful space options key passed to `setOptions` method of provider. Defaults to `default` key, or if only one space settings are passed it will use that one.

###### Example 

```javascript
// pass key defined in setOptions method of provider
contentful.space('another');
// or you can pass 'default', although it will implicitly use this key if parameter is omitted
contentful.space('default');
```

##### Returns

Promise.

## Promises

All methods return a promise.

Depending on the reponse of the API, either the success handler or the error handler
is called with a destructured representation of the response with the following properties:

- **data** – {object} – The response body transformed with the transform functions.
- **status** – {number} – HTTP status code of the response.
- **headers** – {function([headerName])} – Header getter function.
- **config** – {object} – The configuration object that was used to generate the request.
- **statusText** – {string} – HTTP status text of the response.

The data property contains the Contentful data. The other properties are passed for convenience in case you need them.

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

## Automatically resolved linked content

Angular-contentful automatically resolves linked content for you.

If the Contentful API response includes linked content such as linked entries or linked assets, they are
automatically attached to their parent content for maximum convenience.

Suppose you have a collection of dogs that have an image linked to them, you can now access the image
as a direct property instead of having to resolve the image manually:

```xml
<ul contentful-entries="'content_type=dog'">
  <li ng-repeat="dog in $contentfulEntries.items | orderBy:'fields.name' ">
    <h1>{{ dog.fields.name }}</h2>
    <img ng-src="{{ dog.fields.image.fields.file.url }}" />
  </li>
</ul>
```

Due to how the Contentful API works, linked content is only available when using `contentful-entries`, not when using `contentful-entry`. [Read more details here](https://github.com/jvandemo/angular-contentful/issues/11#issuecomment-140298861).

#### Notice

Resolving links hierarchically can cause circular links.

Although this isn't harmful, it may hamper you from outputting the entire response e.g. using `{{ $contentfulEntries | json }}`.

## Connecting to multiple spaces

If you need to connect to more than one Contentful space, you can specify additional spaces in the `contentfulProvider` configuration:

```javascript
angular
  .module('yourApp')
  .config(function(contentfulProvider){
    contentfulProvider.setOptions({
        'default': {
          space: 'first_space',
          accessToken: 'first_token'
        },
        'another': {
          space: 'second_space',
          accessToken: 'second_token'
        }
        ...
    });
  });
```

and pass in the space key as the `optionSet` argument when calling a contentful service method:

```javascript
angular
  .module('yourApp')
  .controller('SomeCtrl', function(contentful){
    
    // Get all entries
    contentful
      .entries('', 'another')
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

If you initialize `contentfulProvider` with only one set of options, it will be treated as the default one.

Currently, the directives do not allow you to specify a space and will always connect to the default space.

## Example raw Contentful responses

These raw response examples give you an idea of what original
Contentful responses look like.

If you are interested in the details, please visit the [Contentful delivery API documentation](https://www.contentful.com/developers/documentation/content-delivery-api/).

#### Example Contentful response for successful request

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

### v2.2.0

- Added support for multiple spaces [#24](https://github.com/jvandemo/angular-contentful/pull/24) (credits to [Vuk Stanković](https://github.com/vuk))

### v2.1.0

- Added module property to package.json for webpack compatibility

### v2.0.0

- **BREAKING CHANGE**: Added support for specifying expressions in directive attributes

### v1.1.0

- Added query string support to contentful-entry directive

### v1.0.0

- Simplified service API so it always resolves links by default
- Simplified contentful-entries directive API to make data available more intuitively using `$contentfulEntries` instead of `$contentfulEntries.entries`
- Simplified contentful-entry directive API to make data available more intuitively using `$contentfulEntry` instead of `$contentfulEntry.entry`
- Removed support for `success` and `error` shorthand methods in favor of more consistent API with `then`.
- Updated documentation

### v0.5.1

- Update contentful-entries directive so it return response identical to contentful service method

### v0.5.0

- Added support to automatically resolve links when multiple entries are returned
- Updated documentation

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
