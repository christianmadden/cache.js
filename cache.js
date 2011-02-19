
// TODO Clean up return values, exceptions, etc.
// TODO Use event listener to know when a value has changed, update it's last_accessed? Last_updated?
// LRU?

/* ******************************************************************************* */
var cache = function()
{
	// Private properties
	var cache_backends = [];
	var cache_prefix = "__cache.";
	var cache_meta_data_suffix = ".meta";
	var cache;
	
	// Private methods that are not cache backend specific
	var getCurrentDatetime = function()
	{
		return (new Date).getTime();
	};
	var getExpirationDatetime = function(expires)
	{
		return getCurrentDatetime() + (expires * 1000);
	};
	var hasExpired = function(expirationDateTime)
	{
		return expirationDateTime <= (new Date()).getTime();
	};
		
	// Private methods to interface with cache backend
	var getValue = function(key)
	{
		return cache.get(cache_prefix + key);
	};
	var setValue = function(key, value)
	{
		cache.set(cache_prefix + key, value);
	};
	var getMetaData = function(key)
	{
		return cache.get(cache_prefix + key + cache_meta_data_suffix);
	};
	var setMetaData = function(key, meta)
	{
		cache.set(cache_prefix + key + cache_meta_data_suffix, meta);
	};
	var removeValue = function(key)
	{
		cache.remove(cache_prefix + key);
		cache.remove(cache_prefix + key + cache_meta_data_suffix);
	}
	var clearCache = function(key)
	{
		cache.clear();
	}
	
	// Public interface
	return {
	
		get: function(key)
		{
			var meta = getMetaData(key);
			if(meta && meta.expires && !hasExpired(meta.expires))
			{
				return getValue(key);
			}
			else
			{
				return null;
			}
		},
		set: function(key, val, seconds_to_expiration)
		{
			var meta = 
			{
				created_at: getCurrentDatetime(),
				accessed_at: null,
				data_type: typeof val,
				expires: getExpirationDatetime(seconds_to_expiration)
			}
			setValue(key, val);
			setMetaData(key, meta);
		},
		remove: function(key)
		{
			return removeValue(key);
		},
		clear: function()
		{
			return clearCache();
		},
		register: function(backend)
		{
			cache_backends.unshift(backend);
			logger.debug(backend);
			cache = cache_backends.pop();
		}
	}
}();
/* ******************************************************************************* */


/* ******************************************************************************* */
cache.register(function()
{
	return {
	
		get: function(key)
		{
			return null;
		},
		set: function(key, val)
		{
			return;
		},
		remove: function(key)
		{
			return;
		},
		clear: function()
		{
			return;
		},
		identify: function(){ return "dummyCache"; }
	}
}());
cache.register(localStorageCache);
/* ******************************************************************************* */








