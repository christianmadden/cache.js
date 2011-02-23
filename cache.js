
if(typeof $cache == "undefined")
{
	var $cache = function()
	{
		var metadata_suffix = ".metadata";
		var cache;
		var cache_backends = [];
		var cache_interface = 
		{
			get: function(){},
			set: function(){},
			remove: function(){},
			keys: function(){},
			supported: function(){},
			type: function(){},
		};
		var implementsCacheInterface = function(backend)
		{
			for(var property in cache_interface)
			{
				if(!backend[property] || (typeof cache_interface[property] != typeof backend[property]))
				{
					return false;
				}
			}
			return true;
		};
		var evict = function()
		{
			var now = (new Date).getTime();
			var items = [];
			for(key in cache.keys())
			{
				// Act on cache.js' keys only
				if(key.indexOf(this.metadata_suffix) >= 0)
				{
					var meta = cache.get(key);
					// If the item is expired, evict it
					if(now > meta.expires_at)
					{
						this.remove(key);
					}
					else
					{
						items.push({ key: key, meta: meta });
					}
				}
			}
			// Sort non-expired items by least recently used
			items.sort(function(a, b)
			{
				return a.meta.accessed_at > b.meta.accessed_at;
			});
			// Evict the LRU item
			this.remove(items.pop().key.replace(metadata_suffix, ""));
		};
		
		return {
	
			get: function(key)
			{
				var now = (new Date).getTime();
				var meta = cache.get(key + this.metadata_suffix);
				if(!meta){ return null; }
				if(now > meta.expires_at)
				{
					this.remove(key);
					return null;
				}
				else
				{
					meta.accessed_at = now;
					cache.set(key + this.metadata_suffix, meta);
					return cache.get(key);
				}
			},
			set: function(key, value, seconds_to_expiration)
			{	
				// Disregard if there is an existing value with this key
				// Setting an existing value updates all of its attributes (created, accessed, expiration)s
				var now = (new Date).getTime();
				meta = 
				{
					created_at: now,
					accessed_at: now,
					expires_at: now + (seconds_to_expiration * 1000)
				}	
				try
				{
					cache.set(key, value);
					cache.set(key + this.metadata_suffix, meta);
				}
				catch(e)
				{
					// If set throws an exception, evict cache data and try again (recursively) until it works
					// TODO evict as much data as this item takes up (slabs, etc?)
					evict();
					this.set(key, value, seconds_to_expiration);
				}
			},
			remove: function(key)
			{
				cache.remove(key);
				cache.remove(key + this.metadata_suffix);
			},
			clear: function()
			{
				// Only remove the values managed by cache.js (values with metadata entries)
				for(key in cache.keys())
				{
					if(key.indexOf(this.metadata_suffix) >= 0)
					{
						this.remove(key.replace(this.metadata_suffix, ""));
					}
				}
			},
			register: function(backend)
			{
				if(backend.supported() && implementsCacheInterface(backend))
				{
					cache_backends.push(backend);
					cache = backend;
				}
			},
			type: function(){ return cache.type(); }
		}
	}();
	
	// Register a dummy cache that implements the cache interface but does no actual caching.
	// If no functional backends are registered, the dummy cache will handle the calls but essentially do nothing.
	$cache.register(
	{
		get: function(key){ return null; },
		set: function(key, val){},
		remove: function(key){},
		keys: function(){ return []; },
		supported: function(){ return true; },
		type: function(){ return "dummyCache"; },
	});
}








