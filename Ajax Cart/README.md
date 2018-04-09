# Ajax cart

This is based on [Timber Ajax cart](https://github.com/Shopify/Timber/blob/master/assets/ajax-cart.js.liquid) and requires:

- jQuery 1.8+
- handlebars.min.js (for cart template)
- modernizr.min.js
- snippet/ajax-cart-template.liquid



## 1. Trigger events before and after every Ajax call

ShopifyAPI.updateCartNote()

- `beforeUpdateCartNote.ajaxCart`
- `afterUpdateCartNote.ajaxCart`
- `errorUpdateCartNote.ajaxCart`
- `completeUpdateCartNote.ajaxCart`

ShopifyAPI.addItemFromForm()

- `beforeAddItem.ajaxCart`
- `afterAddItem.ajaxCart`
- `errorAddItem.ajaxCart`
- `completeAddItem.ajaxCart`

...

## 2. Wrap Ajax Calls with $.when()

Just like `Promise.all()`

We can execute callbacks based on mutiple Ajax calls.

Example usage:
```javascript
ShopifyAPI.changeItem = function (line, quantity, callback, errorCallback) {
    var $body = $(document.body),
        params = {
            type: 'POST',
            url: '/cart/change.js',
            data: 'quantity=' + quantity + '&line=' + line,
            dataType: 'json',
            // ...
    return jQuery.when(jQuery.ajax(params));
};

// change multiple items
var ajaxCalls = [],
	$lineItems = $('.line-items');
    
$.each($lineItems, function(i, ele) {
	var line = $(ele).data('line');
	ajaxCalls.push(ShopifyAPI.changeItem(line, 0));
})

// Do something after all the ajax calls is done
$.when.apply(null, ajaxCalls).then(function() {
	//...
});
	
```

## 3. Decouple cart actions and what happens after that

Less nested callbacks and better cart state management.

Please check out `wacthCartActions()` and `watchCartState` for more details.