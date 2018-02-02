# Recently Viewed

This snippets uses jQuery and [handlebars.js](http://handlebarsjs.com/) to build a recently viewed products section.

e.g.

```javascript
	theme.RecentlyViewed.setup({
		currentProduct: this.config.productId,
		limit: 5,
		gridWidth: 'one-fifth',
		imageSize: '500x500',
		container: '.product-template',
		source: '#RecentlyViewed'

		// callback function
	}, function($container) {
		var $slideshow = $container.find('.product-single__recently-viewed .slideshow');
		// init recently viewed slider using slick slider
		$slideshow.slick({
			accessibility: true,
			arrows: true,
			infinite: true,
			dots: false,
			slidesToShow: 3,
			slidesToScroll: 3,
			autoplay: false
		});
	});
```

# Some Helpers used in this snippets

## `theme.Line`

With this helper, we use chainable methods to manipulate `String` and `Array` data

e.g.

```javascript
  var recentlyViewed = [1, 2, 3];
  recentlyViewed = new theme.Line(recentlyViewed).remove(2).push(4).fold(); // [1, 3, 4]
```

## `theme.Storage`

### Set item:

`theme.Storage.set(key, value, expiration)`

### Get Item:

`theme.Storage.get(key)`

Will return `null` if the item doesn't exist or has expired.

### Remove Item:

`theme.Storage.remove(key)`

# Check Expiration:

`theme.Storage.checkExpiration(key)`