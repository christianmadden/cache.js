
// Localstorage-backed cache backend for cache.js
// Implements a LRU (least recently used) approach to evicting data from the cache

$cache.register(function()
{
	var supportsFeature = function(feature)
	{
		try
		{
			return feature in window && window[feature] !== null;
		}
		catch(e){ return false; }
	};
	var supportsLocalStorage = function(){ return supportsFeature("localStorage"); };
	var supportsJSON = function(){ return supportsFeature("JSON"); };
	
	return {
	
		get: function(key)
		{
			var value = localStorage.getItem(key);
			
			// Try to parse the string into JSON data
			// We have no idea if the string is JSON data until we try to parse it
			if(value && supportsJSON())
			{
				try
				{
					value = JSON.parse(value);
				}
				catch(e){ return value; }
			}
			return value;
		},
		set: function(key, value)
		{
			// Try to encode the data into a JSON string
			if(supportsJSON())
			{
				try{ value = JSON.stringify(value); }
				catch(e){}
			}
			try
			{
				localStorage.setItem(key, value);
			}
			catch(e)
			{
				if(e.name === "QUOTA_EXCEEDED_ERR")
				{
					throw e;
				}
			}
		},
		remove: function(key)
		{
			localStorage.removeItem(key);
		},
		clear: function()
		{
			localStorage.clear();
		},
		keys: function()
		{
			var keys = (keys in localStorage);
			return keys;
		},
		supported: function(){ return supportsLocalStorage(); },
		type: function(){ return "localstorageCache"; }
	}
}());
