# Ajax cart

This requires:
    - jQuery 1.8+
    - handlebars.min.js (for cart template)
    - modernizr.min.js
    - snippet/ajax-cart-template.liquid

Based on [Timber Ajax cart](https://github.com/Shopify/Timber/blob/master/assets/ajax-cart.js.liquid)

## Updates I made

### Trigger events before and after aevery Ajax call

#### ShopifyAPI.updateCartNote()
`beforeUpdateCartNote.ajaxCart` `afterUpdateCartNote.ajaxCart`