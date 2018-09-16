# Some handy Shopify API methods

This is based on [Timber Ajax cart](https://github.com/Shopify/Timber/blob/master/assets/ajax-cart.js.liquid)

## Trigger events before and after every Ajax call

For example, `ShopifyAPI.addItemFromForm()`

- `beforeAddItem.ajaxCart`
- `afterAddItem.ajaxCart`
- `errorAddItem.ajaxCart`
- `completeAddItem.ajaxCart`

```javascript
ShopifyAPI.addItem = function(data, callback, errorCallback) {
  var $body = $(document.body),
    params = {
      // ...
      beforeSend: function() {
        $(document.body).trigger("beforeAddItem.ajaxCart", data);
      },
      success: function(lineItem) {
        // ...
        $body.trigger("afterAddItem.ajaxCart", [lineItem]);
      },
      error: function(XMLHttpRequest, textStatus) {
        // ...
        $body.trigger("errorAddItem.ajaxCart", [XMLHttpRequest, textStatus]);
      },
      complete: function(jqxhr, text) {
        $body.trigger("completeAddItem.ajaxCart", [this, jqxhr, text]);
      }
    };

  return ShopifyAPI.promiseChange(params);
};
```

## 2. Store the cart state to localStorage after each Ajax call

Inside `ShopifyAPI.promiseChange`, we store the cart state to localStorage everytime we make an Ajax call.

```javascript
ShopifyAPI.promiseChange = function(params) {
  var promiseRequest = $.ajax(params);
  return (
    promiseRequest
      // Some cart API requests don't return the cart object.
      // If there is no cart object then get one before proceeding.
      .then(function(state) {
        if (typeof state.token === "undefined") {
          return ShopifyAPI.getCart();
        } else {
          return state;
        }
      })
      .then(function(state) {
        localStorage.shopify_cart_state = JSON.stringify(state);
        return state;
      })
  );
};
```
