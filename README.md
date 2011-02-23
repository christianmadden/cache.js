
### cache.js ###

Cache.js is a Javascript cache that is inspired by memcached and other key/value stores.

It can be used to cache any Javascript object, the JSON data returned by an AJAX call, for example.

By default, cache.js provides a localStorage-based cache, but is extensible and can use other cache backends.

## Basic Usage ##

In order to use cache.js, add the main Javascript file and the localStorage cache backend to your page.

	<script src="js/cache.js"></script>
	<script src="js/cache-localstorage.js"></script>

The API for the cache is very simple. The two most common methods are:

	$cache.set(key, value, seconds_to_expiration);

The set method places a key/value pair into the cache. This key/value pair will expire after the number of seconds specified elapse.
	
	$cache.get(key);

The get method retrieves a key/value pair by its key. If the key isn't present, or the key/value pair has expired, null is returned.

# Example #

A basic usage pattern might look something like this:

	var my_data = $cache.get("mine");
	if(!my_data)
	{
		var my_data =[...];
		$cache.set("mine", my_data, 60 * 10);
	}
	doSomethingWith(my_data);
	
This example tries to get data from the cache first. If it succeeds, the cached data is used. If there is no matching data in the cache
(either because it hasn't been set yet or it has expired), the data is retrieved (via an AJAX call or whatever the case may be), then stored in the cache.

# Metadata #

Cache.js stores two key/value pairs for each piece of data cached. The first is the data itself, which is stored normally using the key provided in set().
The second key/value pair stores metadata for the item being stored, including its creation date, last accessed date and expiration date. The metadata 
is managed by cache.js and does not ever need to be accessed directly.

# Other Methods #

The cache also provides these other methods:

* remove(key): Removes a key/value pair (and its metadata) by key
* clear(): Clears all key/value pairs that are managed by cache.js (including their metadata)
* register(backend): Registers a new cache backend
* type(): Returns a string which identifies the current cache backend type


## Cache Backends ##

The cache backend is the code responsible for persisting cache data to some data store. This data store could be HTML5 localStorage, cookies or any other
means of persisting data in a user's browser. A localStorage cache backend is provided with cache.js, but new cache backends are easy to write and integrate.

A cache backend is just a Javascript object that must implement the following methods:

* get(key): Gets a key/value pair by key
* set(key, value): Sets a key/value pair
* remove(key): Removes a key/value pair by key
* keys(): Returns an array of all keys stored by the cache backend
* supported(): Returns a boolean indicating whether the users browser supports this cache backend
* type(): A string indicating the cache backend type ("localStorage", etc)
	
The existence of these methods is checked by cache.js when the cache backend is registered. 

	$cache.register(backend); 

If the required methods have been implemented, and a call to support() returns true, the cache backend is added to the cache. Backends are added in the
order the're registered, and the last backend successfullly added is the one that will be used to persist data.



	