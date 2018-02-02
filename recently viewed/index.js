/**
 * API Helpers
 * --------------------------
 */

ShopifyAPI.getProducts = function (url, callback) {
	var params = {
		type: 'GET',
		url: url,
		success: function (data) {
			if (typeof callback === 'function') {
				callback(data);
			}
		},
		fail: function (jqXHR, textStatus) {
			ShopifyAPI.onError(jqXHR, textStatus);
		},
		dataType: 'json'
	};

	// make this function thenable
	return jQuery.when(jQuery.ajax(params));
}


/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 * See the original snippet at https://themes.shopify.com/themes/debut/styles/default
 */

theme.Images = (function () {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

	function preload(images, size) {
		if (typeof images === 'string') {
			images = [images];
		}

		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			this.loadImage(this.getSizedImageUrl(image, size));
		}
	}

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
	function loadImage(path) {
		new Image().src = path;
	}

  /**
   * Swaps the src of an image for another OR returns the imageURL to the callback function
   * @param image
   * @param element
   * @param callback
   */
	function switchImage(image, element, callback) {
		var size = this.imageSize(element.src);
		var imageUrl = this.getSizedImageUrl(image.src, size);

		if (callback) {
			callback(imageUrl, image, element); // eslint-disable-line callback-return
		} else {
			element.src = imageUrl;
		}
	}

  /**
   * +++ Useful
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
	function imageSize(src) {
		var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

		if (match !== null) {
			return match[1];
		} else {
			return null;
		}
	}

  /**
   * +++ Useful
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
	function getSizedImageUrl(src, size) {
		if (size == null) {
			return src;
		}

		if (size === 'master') {
			return this.removeProtocol(src);
		}

		var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

		if (match != null) {
			var prefix = src.split(match[0]);
			var suffix = match[0];

			return this.removeProtocol(prefix[0] + '_' + size + suffix);
		}

		return null;
	}

	function removeProtocol(path) {
		return path.replace(/http(s)?:/, '');
	}

	return {
		preload: preload,
		loadImage: loadImage,
		switchImage: switchImage,
		imageSize: imageSize,
		getSizedImageUrl: getSizedImageUrl,
		removeProtocol: removeProtocol
	};
})();


/**
 * Linear Data Helper
 * --------------------------
 * Linear string and array operation flow
 * Inspired by https://egghead.io/courses/professor-frisby-introduces-composable-functional-javascript
 * 
 */

theme.Line = (function (value) {
	function Line(value) {
		this.value = value;
	}

	Line.prototype = _.assignIn({}, Line.prototype, {
		// string methods
		split: function (spliter) {
			this.value = this.value.split(spliter);
			return new theme.Line(this.value);
		},

		concat: function (str) {
			this.value = this.value.concat(str);
			return new theme.Line(this.value);
		},

		// array methods
		join: function (joiner) {
			this.value = this.value.join(joiner);
			return new theme.Line(this.value);
		},

		push: function (item) {
			this.value.push(item)
			return new theme.Line(this.value);
		},

		pop: function () {
			this.value.pop();
			return new theme.Line(this.value);
		},

		shift: function () {
			this.value.shift();
			return new theme.Line(this.value);
		},

		first: function () {
			var value = this.value.splice(0, 1);
			return new theme.Line(value);
		},

		last: function () {
			var value = this.value.splice(-1);
			return new Line(value);
		},

		splice: function (index, count, item) {
			if (!item) {
				var value = this.value.splice(index, count);
			} else {
				var value = this.value.splice(index, count, item);
			}

			return new theme.Line(value);
		},

		insert: function (index, item) {
			var value = this.value.splice(index, 0, item);
			return new theme.Line(value);
		},

		deArray: function () {
			return new theme.Line(this.value[0]);
		},

		// other methods
		prepend: function (item) {
			if (Array.isArray(this.value)) {
				this.value.unshift(item);
			} else if (typeof this.value == 'string') {
				this.value = item + this.value;
			}

			return new theme.Line(this.value);
		},

		remove: function (item) {
			if (Array.isArray(this.value)) {
				var index = this.value.indexOf(item);
				this.value.splice(index, 1);
			} else if (typeof this.value == 'string') {
				this.value = this.value.split(item).join('');
			}

			return new theme.Line(this.value);
		},

		copy: function () {
			if (Array.isArray(this.value)) {
				var value = this.value.slice();
			} else if (typeof this.value == 'string') {
				var value = this.value;
			}

			return new theme.Line(value);
		},

		then: function (f) {
			return new theme.Line(f(this.value));
		},

		fold: function () {
			return this.value;
		}
	});

	return Line;
})();


/**
 * Local Storage Helper
 * --------------------------
 * Added expiration feature to the native localStorage API
 */

theme.Storage = (function () {
	var set = function (key, value, expiration) {
		var _value = {
			value: value,
			expiration: expiration,
			createdAt: new Date()
		};

		localStorage.setItem(key, JSON.stringify(_value));
	};

	var get = function (key) {
		// _value saved as string
		var _valueRaw = localStorage.getItem(key);

		if (!_valueRaw) {
			// when item doesn't exist 
			console.log("Item doesn't exist!");
			return undefined;
		} else {
			// when item exist
			var _value = JSON.parse(_valueRaw);

			if (!_value.expiration) {
				// if doesn't have an expiration date
				return _value.value;
			} else {
				// check expiration
				if (new Date(_value.expiration) > new Date()) {
					return _value.value;
				} else {
					this.remove(key);
					console.log('This item is expired!');
					return undefined;
				}
			}
		};
	}

	var remove = function (key) {
		return localStorage.removeItem(key);
	}

	var checkExpiration = function (key) {
		// _value saved as string
		var _valueRaw = localStorage.getItem(key);

		if (!_valueRaw) {
			console.log("Item doesn't exist!");
			return undefined;
		} else {
			var expiration = JSON.parse(_valueRaw).expiration;
			if (!expiration) {
				console.log("This item doesn't have expiration date!");
				return undefined;
			} else {
				var isExpired = new Date(expiration) > new Date() ? false : true;
				return isExpired;
			}
		}
	}

	return {
		set: set,
		get: get,
		remove: remove,
		checkExpiration: checkExpiration
	}
})();


/*============================================================================
  Recently viewed products
==============================================================================*/
theme.RecentlyViewed = (function () {
	var recentlyViewed = [];
	var settings;

	/**
	 * Setup recently viewed
	 * 
	 * @param {Object} config - All the settings we need to init the recently viewed
	 * @param {Number} config.currentProduct - The product we are currently viewing
	 * @param {Number} config.limit          - The maxmum quantity of our recently viewed products
	 * @param {String} config.gridWidth      - The width helper class e.g. `one-fifth`
	 * @param {String} config.imageSize      - The product grid image size e.g. `500x500`
	 * @param {String} config.container      - The css selector of the recently viewed container
	 * @param {String} config.source         - The css selector of the handlebars template
	 * 
	 * @param {Function} finalCallback - A callback function that will be called after the recently viewed section is rendered, accepts `$(config.container)` as an argument
	 */

	var setup = function (config, finalCallback) {
		init(config);
		getProducts(finalCallback);
		update();
	}

	// Init settings for internal use
	// Init recently viwed localstorage data if doesn't exist
	var init = function (config) {
		if (!theme.Storage.get('shopifyRecentlyViewed-vapeworld')) {
			theme.Storage.set('shopifyRecentlyViewed-vapeworld', []);
		}

		recentlyViewed = theme.Storage.get('shopifyRecentlyViewed-vapeworld');
		settings = config;
	}

	// Get recently viewed products data from the Shopify API
	var getProducts = function (cb) {
		// if recently viewed is empty, do nothing
		if (!recentlyViewed.length) { return; }

		// if recently viewed is not empty, render the view 
		var url = '{{shop.domin}}/admin/products.json?ids=' + recentlyViewed.join(',');

		ShopifyAPI.getProducts(url, function (data) {
			formatData(data, cb);
		});
	}

	// Render view template using the returned data
	var renderTemplate = function (context, cb) {
		var template = Handlebars.compile($(settings.source).html()),
			html = template(context),
			$container = $(settings.container);

		$container.append(html);

		if (cb) { cb($container); }
	}

	// Build the context for the render method
	var formatData = function (data, cb) {
		var context = {
			products: [],
			gridWidth: settings.gridWidth
		};

		$.each(data.products, function (i, product) {
			// get product quantity to decide availability
			var quantity = product.variants.reduce(function (prevQty, variant) {
				return prevQty += variant.inventory_quantity;
			}, 0);

			// product data going to be pushed into context.products
			var productData = {
				url: "https://vapeworld-store.myshopify.com/products/" + product.handle,
				image: product.image ? theme.Images.getSizedImageUrl(product.image.src, settings.imageSize) : 'https://acp-magento.appspot.com/images/missing.gif',
				title: product.title,
				available: quantity > 0 ? true : false
			}

			context.products.push(productData);
		});

		renderTemplate(context, cb);
	}

	// Update local storage data
	var update = function () {
		var productId = settings.currentProduct;
		var limit = settings.limit ? settings.limit : 5;
		var currentIndex = recentlyViewed.indexOf(productId);

		// add product, if it's not in the current record
		if (currentIndex == -1) {
			recentlyViewed.push(productId);
			// put the item to the last, if it's in the record and not the last one
			// do nothing if the item is the last one in the record
		} else if (currentIndex != limit - 1) {
			recentlyViewed = new theme.Line(recentlyViewed).remove(productId).push(productId).fold();
		}

		// limit how many products we record
		if (recentlyViewed.length > limit) {
			recentlyViewed.shift();
		}

		// update localStorage recently viewed
		theme.Storage.set('shopifyRecentlyViewed-vapeworld', recentlyViewed);
	}

	return {
		setup: setup
	}
})();