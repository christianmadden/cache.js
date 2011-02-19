


/* ******************************************************************************* */
var localStorageCache = function()
{
	// Private methods
	var supportsFeature = function(feature)
	{
		try
		{
			return feature in window && window[feature] !== null;
		}
		catch(e)
		{	
			return false;
		}
	};
	var isSupported = function(){ return supportsFeature("localStorage"); };
	var supportsJSON = function(){ return supportsFeature("JSON"); };
	
	// Public interface
	return {
	
		get: function(key)
		{
			if(!isSupported()){ throw "This cache type is not supported: localStorage"; }
			
			var val = localStorage.getItem(key);
			
			// Try to parse the string into JSON data
			// We have no idea if the string is JSON data until we try to parse it (TODO: metadata?)
			if(val && supportsJSON())
			{
				try
				{
					val = JSON.parse(localStorage.getItem(key));
				}
				catch(e)
				{
					throw e;
				}
			}
			return val;
		},
		set: function(key, val)
		{
			if(!isSupported()){ throw "This cache type is not supported: localStorage"; }
			
			if(supportsJSON())
			{
				try{ val = JSON.stringify(val); }
				catch(e){}
			}
			try
			{
				localStorage.setItem(key, val);
			}
			catch(e)
			{
				if(e.name === "QUOTA_EXCEEDED_ERR")
				{
					// TODO Remove data until this doesn't happen anymore, then store
					// Race condition?
					return null;
				}
			}
		},
		remove: function(key)
		{
			if(!isSupported()){ throw "This cache type is not supported: localStorage"; }
			try
			{
				localStorage.removeItem(key);
			}
			catch(e)
			{
				throw e;
			}
		},
		clear: function()
		{
			if(!isSupported()){ return false; } // TODO throw CacheNotSupported Exception?
			{
				try
				{
					localStorage.clear();
				}
				catch(e)
				{
					throw e;
				}
			}
		},
		identify: function(){ return "localstorageCache"; }
	}
}();
/* ******************************************************************************* */
