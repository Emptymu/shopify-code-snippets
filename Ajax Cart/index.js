/*============================================================================
  Money Format
  - Shopify.format money is defined in option_selection.js.
    If that file is not included, it is redefined here.
==============================================================================*/
if ((typeof Shopify) === 'undefined') { Shopify = {}; }
if (!Shopify.formatMoney) {
    Shopify.formatMoney = function (cents, format) {
        var value = '',
            placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
            formatString = (format || this.money_format);

        if (typeof cents == 'string') {
            cents = cents.replace('.', '');
        }

        function defaultOption(opt, def) {
            return (typeof opt == 'undefined' ? def : opt);
        }

        function formatWithDelimiters(number, precision, thousands, decimal, noTrailingZeros) {
            precision = defaultOption(precision, 2);
            thousands = defaultOption(thousands, ',');
            decimal = defaultOption(decimal, '.');

            if (isNaN(number) || number == null) {
                return 0;
            }

            number = (number / 100.0).toFixed(precision);

            var parts = number.split('.'),
                dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
                cents = parts[1] ? (decimal + parts[1]) : '';

            if (parts[1] == '00' && noTrailingZeros) {
                return dollars;
            } else {
                return dollars + cents;
            }
        }

        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_trailing_zeros':
                value = formatWithDelimiters(cents, 2, ',', '.', true);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
        }

        return formatString.replace(placeholderRegex, value);
    };
}

/*============================================================================
  Ajax the add to cart experience by revealing it in a side drawer
  Plugin Documentation - http://shopify.github.io/Timber/#ajax-cart
  (c) Copyright 2015 Shopify Inc. Author: Carson Shold (@cshold). All Rights Reserved.

  This file includes:
    - Basic Shopify Ajax API calls
    - Ajax cart plugin

  This requires:
    - jQuery 1.8+
    - handlebars.min.js (for cart template)
    - modernizr.min.js
    - snippet/ajax-cart-template.liquid

  Customized version of Shopify's jQuery API
  (c) Copyright 2009-2015 Shopify Inc. Author: Caroline Schnapp. All Rights Reserved.
==============================================================================*/
if ((typeof ShopifyAPI) === 'undefined') { ShopifyAPI = {}; }

/*============================================================================
  API Helper Functions
==============================================================================*/
function attributeToString(attribute) {
    if ((typeof attribute) !== 'string') {
        attribute += '';
        if (attribute === 'undefined') {
            attribute = '';
        }
    }
    return jQuery.trim(attribute);
};

/*============================================================================
  API Functions
==============================================================================*/
ShopifyAPI.onCartUpdate = function (cart) {
    // alert('There are now ' + cart.item_count + ' items in the cart.');
};

ShopifyAPI.updateCartNote = function (note, callback) {
    var $body = $(document.body),
        params = {
            type: 'POST',
            url: '/cart/update.js',
            data: 'note=' + attributeToString(note),
            dataType: 'json',
            beforeSend: function () {
                $body.trigger('beforeUpdateCartNote.ajaxCart', note);
            },
            success: function (cart) {
                if ((typeof callback) === 'function') {
                    callback(cart);
                }
                else {
                    ShopifyAPI.onCartUpdate(cart);
                }
                $body.trigger('afterUpdateCartNote.ajaxCart', [note, cart]);
            },
            error: function (XMLHttpRequest, textStatus) {
                $body.trigger('errorUpdateCartNote.ajaxCart', [XMLHttpRequest, textStatus]);
                ShopifyAPI.onError(XMLHttpRequest, textStatus);
            },
            complete: function (jqxhr, text) {
                $body.trigger('completeUpdateCartNote.ajaxCart', [this, jqxhr, text]);
            }
        };
    jQuery.ajax(params);
};

ShopifyAPI.onError = function (XMLHttpRequest, textStatus) {
    var data = eval('(' + XMLHttpRequest.responseText + ')');
    if (!!data.message) {
        alert(data.message + '(' + data.status + '): ' + data.description);
    }
};

/*============================================================================
  POST to cart/add.js returns the JSON of the cart
    - Allow use of form element instead of just id
    - Allow custom error callback
==============================================================================*/
ShopifyAPI.addItemFromForm = function (form, callback, errorCallback) {
    var $body = $(document.body),
        params = {
            type: 'POST',
            url: '/cart/add.js',
            data: jQuery(form).serialize(),
            dataType: 'json',
            beforeSend: function () {
                $(document.body).trigger('beforeAddItem.ajaxCart', form);
            },
            success: function (line_item) {
                if ((typeof callback) === 'function') {
                    callback(line_item, form);
                }

                $body.trigger('afterAddItem.ajaxCart', [line_item, form]);
            },
            error: function (XMLHttpRequest, textStatus) {
                if ((typeof errorCallback) === 'function') {
                    errorCallback(XMLHttpRequest, textStatus);
                }
                else {
                    ShopifyAPI.onError(XMLHttpRequest, textStatus);
                }
                $body.trigger('errorAddItem.ajaxCart', [XMLHttpRequest, textStatus]);
            },
            complete: function (jqxhr, text) {
                $body.trigger('completeAddItem.ajaxCart', [this, jqxhr, text]);
            }
        };

    return jQuery.when(jQuery.ajax(params));
};

// Get from cart.js returns the cart in JSON
ShopifyAPI.getCart = function (callback, errorCallback) {
    var $body = $(document.body),
        params = {
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            beforeSend: function () {
                $body.trigger('beforeGetCart.ajaxCart');
            },
            success: function (cart) {
                if (typeof callback === 'function') {
                    callback(cart);
                }
            },
            error: function (XMLHttpRequest, textStatus) {
                if ((typeof errorCallback) === 'function') {
                    errorCallback(XMLHttpRequest, textStatus);
                }
                else {
                    ShopifyAPI.onError(XMLHttpRequest, textStatus);
                }
                $body.trigger('errorGetCart.ajaxCart', [XMLHttpRequest, textStatus]);
            },
            complete: function (cart) {
                $body.trigger('completeGetCart.ajaxCart', [this, cart]);
            }
        };

    return jQuery.when(jQuery.ajax(params));
};

// Update cart, bulk change cart items
ShopifyAPI.updateCart = function (data, callback, errorCallback) {
    var $body = $(document.body),
        params = {
            type: 'POST',
            url: '/cart/update.js',
            data: {
                updates: data
            },
            dataType: 'json',
            beforeSend: function () {
                $body.trigger('beforeUpdateItems.ajaxCart', data);
            },
            success: function (cart) {
                if (typeof callback === 'function') {
                    callback(cart);
                }

                $body.trigger('afterUpdateItems.ajaxCart', caert);
            },
            error: function (XMLHttpRequest, textStatus) {
                if ((typeof errorCallback) === 'function') {
                    errorCallback(XMLHttpRequest, textStatus);
                }
                else {
                    ShopifyAPI.onError(XMLHttpRequest, textStatus);
                }
                $body.trigger('errorUpdateItems.ajaxCart', [XMLHttpRequest, textStatus]);
            },
            complete: function (jqxhr, text) {
                $body.trigger('completeUpdateItems.ajaxCart', [this, jqxhr, text]);
            }
        };

    return jQuery.when($.ajax(params));
};

// POST to cart/change.js returns the cart in JSON
ShopifyAPI.changeItem = function (line, quantity, callback, errorCallback) {
    var $body = $(document.body),
        params = {
            type: 'POST',
            url: '/cart/change.js',
            data: 'quantity=' + quantity + '&line=' + line,
            dataType: 'json',
            beforeSend: function () {
                $body.trigger('beforeChangeItem.ajaxCart', [line, quantity]);
            },
            success: function (cart) {
                if ((typeof callback) === 'function') {
                    callback(cart);
                }

                $body.trigger('afterChangeItem.ajaxCart', [line, quantity]);
            },
            error: function (XMLHttpRequest, textStatus) {
                if ((typeof errorCallback) === 'function') {
                    errorCallback(XMLHttpRequest, textStatus);
                }
                else {
                    ShopifyAPI.onError(XMLHttpRequest, textStatus);
                }
                $body.trigger('errorChangeItem.ajaxCart', [XMLHttpRequest, textStatus]);
            },
            complete: function (jqxhr, text) {
                $body.trigger('completeChangeItem.ajaxCart', [this, jqxhr, text]);
            }
        };

    
    return jQuery.when(jQuery.ajax(params));
};

/*============================================================================
  Ajax Shopify Add To Cart
==============================================================================*/
var ajaxCart = (function (module, $) {

    'use strict';

    // Public functions
    var init, loadCart;

    // Private general variables
    var settings, isUpdating, $body;

    // Private plugin variables
    var $formContainer, $addToCart, $cartCountSelector, $cartCostSelector, $cartContainer, $drawerContainer;

    // Handle Events (add, remove, adjust etc.)
    var watchCartActions, watchCartState;

    // Private functions
    var initAjaxQtySelectors, initQtySelectors;

    // Callbacks
    var updateCountPrice, itemErrorCallback, cartUpdateCallback, buildCart;

    // Helpers
    var validateQty, delay, promisify;

    /*============================================================================
      Initialise the plugin and define global options
    ==============================================================================*/

    // public functions

    init = function (options) {
        // Default settings
        settings = {
            formSelector: 'form[action^="/cart/add"]',
            cartContainer: '#CartContainer',
            addToCartSelector: 'input[type="submit"]',
            cartCountSelector: null,
            cartCostSelector: null,
            moneyFormat: '${{amount}}',
            disableAjaxCart: false,
            enableQtySelectors: true
        };

        // Override defaults with arguments
        $.extend(settings, options);

        // Select DOM elements
        $formContainer = $(settings.formSelector);
        $cartContainer = $(settings.cartContainer);
        $addToCart = $formContainer.find(settings.addToCartSelector);
        $cartCountSelector = $(settings.cartCountSelector);
        $cartCostSelector = $(settings.cartCostSelector);

        // General Selectors
        $body = $(document.body);

        // Track cart activity status
        isUpdating = false;

        // Replace normal qty with js qty selectors
        if (settings.enableQtySelectors) {
            initQtySelectors();
        }

        // Init ajax qty selectors
        initAjaxQtySelectors();

        // listen add, remove, and adjust events
        watchCartActions();

        // listen different events
        watchCartState();
    };

    loadCart = function () {
        ShopifyAPI.getCart(cartUpdateCallback);
    };

    // private functions

    // product page js qty selectors
    initQtySelectors = function () {
        // Change number inputs to JS ones, similar to ajax cart but without API integration.
        // Make sure to add the existing name and id to the new input element
        var numInputs = $('input[type="number"]');

        if (numInputs.length) {
            numInputs.each(function () {
                var $el = $(this),
                    currentQty = $el.val(),
                    inputName = $el.attr('name'),
                    inputId = $el.attr('id');

                var itemAdd = currentQty + 1,
                    itemMinus = currentQty - 1,
                    itemQty = currentQty;

                var source = $("#JsQty").html(),
                    template = Handlebars.compile(source),
                    data = {
                        key: $el.data('id'),
                        itemQty: itemQty,
                        itemAdd: itemAdd,
                        itemMinus: itemMinus,
                        inputName: inputName,
                        inputId: inputId
                    };

                // Append new quantity selector then remove original
                $el.after(template(data)).remove();
            });

            // Setup listeners to add/subtract from the input
            $('.js-qty__adjust').on('click', function () {
                var $el = $(this),
                    id = $el.data('id'),
                    $qtySelector = $el.siblings('.js-qty__num'),
                    qty = parseInt($qtySelector.val().replace(/\D/g, ''));

                var qty = validateQty(qty);

                // Add or subtract from the current quantity
                if ($el.hasClass('js-qty__plus')) {
                    qty += 1;
                } else {
                    qty -= 1;
                    if (qty <= 1) qty = 1;
                }

                // Update the input's number
                $qtySelector.val(qty);
            });
        }
    };

    // ajax cart qty selectors
    initAjaxQtySelectors = function () {
        // If there is a normal quantity number field in the ajax cart, replace it with our version
        if ($('input[type="number"]', $cartContainer).length) {
            $('input[type="number"]', $cartContainer).each(function () {
                var $el = $(this),
                    currentQty = $el.val();

                var itemAdd = currentQty + 1,
                    itemMinus = currentQty - 1,
                    itemQty = currentQty;

                var source = $("#AjaxQty").html(),
                    template = Handlebars.compile(source),
                    data = {
                        key: $el.data('id'),
                        itemQty: itemQty,
                        itemAdd: itemAdd,
                        itemMinus: itemMinus
                    };

                // Append new quantity selector then remove original
                $el.after(template(data)).remove();
            });
        }

        // Adjust displaying qty and trigger the change event
        $body.on('click', '.ajaxcart__qty-adjust', function () {
            if (isUpdating) {
                return
            }

            var $el = $(this),
                $row = $(this).closest('.ajaxcart__row'),
                line = $el.data('line'),
                $qtySelector = $el.siblings('.ajaxcart__qty-num'),
                qty = validateQty(parseInt($qtySelector.val().replace(/\D/g, '')));

            // Add or subtract from the current quantity
            if ($el.hasClass('ajaxcart__qty-plus')) {
                qty += 1;
            } else {
                qty -= 1;
                if (qty <= 0) qty = 0;
            }

            // update the input's number
            $qtySelector.val(qty);

            // Trigger the change event
            $qtySelector.trigger('change', [line, qty]);
        });

        // Highlight the text when focused
        $body.on('focus', '.ajaxcart__qty-adjust', function () {
            var $el = $(this);
            setTimeout(function () {
                $el.select();
            }, 50);
        });
    };

    // Watch cart actions like add, change and remove
    watchCartActions = function () {
        // Add items out of the ajax cart
        // Take over the add to cart form submit action if ajax enabled
        if (!settings.disableAjaxCart && $addToCart.length) {
            $formContainer.on('submit', function (evt) {
                evt.preventDefault();

                // Prevent cart from being submitted while quantities are changing
                if (isUpdating) {
                    return;
                }
                $body.trigger('beforeCartChange.ajaxCart');
                ShopifyAPI.addItemFromForm(evt.target, null, itemErrorCallback)
                    .then(function () {
                        ShopifyAPI.getCart(cartUpdateCallback).then(function () {
                            $body.trigger('completeCartChange.ajaxCart');
                        });
                    });
            });
        }

        // Delegate all events because elements reload with the cart

        // Remove items
        $body.on('click', '.ajaxcart__btn-remove', function (evt) {
            evt.preventDefault();

            if (isUpdating) {
                return
            }

            var id = $(this).data('id'),
                $row = $(this).closest('.ajaxcart__row'),
                line = $row.data('line'),
                qty = 0;

            $body.trigger('beforeCartChange.ajaxCart', [$row, qty]);

            // Slight delay to make sure removed animation is done
            ShopifyAPI.changeItem(line, qty, updateCountPrice)
                .then(function (cart) {

                    // Reprint cart on short timeout so you don't see the content being removed
                    delay(300).then(function () {
                        ShopifyAPI.getCart(cartUpdateCallback).then(function () {
                            $body.trigger('completeCartChange.ajaxCart');
                        });
                    });
                });
        });

        // Adjust qty
        $body.on('change', '.ajaxcart__qty-num', function (evt, line, qty) {
            var $row = $('.ajaxcart__row[data-line="' + line + '"]');

            // if the event is triggered by thie input instead of the qty adjust buttons
            if (!qty) {
                qty = parseInt($(evt.target).val());
            }

            if (!line) {
                line = parseInt($(evt.target).data('line'));
            }

            $body.trigger('beforeCartChange.ajaxCart', [$row, qty]);

            // Slight delay to make sure removed animation is done
            ShopifyAPI.changeItem(line, qty, updateCountPrice)
                .then(function (cart) {
                    // Reprint cart on short timeout so you don't see the content being removed
                    delay(300).then(function () {
                        ShopifyAPI.getCart(cartUpdateCallback).then(function () {
                            $body.trigger('completeCartChange.ajaxCart');
                        });
                    });
                });
        });

        // Submit ajax cart
        $body.on('submit', 'form.ajaxcart', function (evt) {
            if (isUpdating) {
                evt.preventDefault();
            }
        });

        // Save note anytime it's changed
        $body.on('change', 'textarea[name="note"]', function() {
          var newNote = $(this).val();

          // Update the cart note in case they don't click update/checkout
          ShopifyAPI.updateCartNote(newNote, function(cart) {});
        });
    }

    // Watch cart state like beforeCartChange and completeCartChange
    watchCartState = function () {
        // change add to cart button style
        $body.on('beforeAddItem.ajaxCart', function () {
            isUpdating = true
            // Remove any previous quantity errors
            $('.qty-error').remove();

            // Add class to be styled if desired
            $addToCart.removeClass('is-added').addClass('is-adding');
        });

        $body.on('completeAddItem.ajaxCart', function () {
            $addToCart.removeClass('is-adding').addClass('is-added');
            isUpdating = false
        });

        $body.on('errorAddItem.ajaxCart', function() {
            $addToCart.removeClass('is-adding is-added');
        });

        // change cart style
        $body.on('beforeCartChange.ajaxCart', function (evt, $row, qty) {
            isUpdating = true

            if (qty == 0) {
                $row.addClass('is-removing');
            }

            // show spinner
            $body.addClass('cart--is-loading');
        });

        $body.on('completeCartChange.ajaxCart', function () {
            // hide spinner
            $body.removeClass('cart--is-loading');

            isUpdating = false
        });
    }

    // callbacks

    cartUpdateCallback = function (cart) {
        // Update quantity and price icons
        updateCountPrice(cart);

        //build cart
        buildCart(cart);

        //init paypal button
        if (window.Shopify && Shopify.StorefrontExpressButtons) {
            Shopify.StorefrontExpressButtons.initialize();
        }
    };

    updateCountPrice = function (cart) {
        if ($cartCountSelector) {
            $cartCountSelector.html(cart.item_count);
        }
        if ($cartCostSelector) {
            $cartCostSelector.html(Shopify.formatMoney(cart.total_price, settings.moneyFormat));
        }
    };

    buildCart = function (cart) {
        // Start with a fresh cart div
        $cartContainer.empty();

        // Show empty cart
        if (cart.item_count === 0) {
            $cartContainer.append('<p class="ajaxcart__empty-message">You have no items in your shopping cart.</p>');
            return;
        }

        // Handlebars.js cart layout
        var items = [],
            item = {},
            data = {},
            source = $("#CartTemplate").html(),
            template = Handlebars.compile(source);

        // Add each item to our handlebars.js data
        $.each(cart.items, function (index, cartItem) {
            // Create item's data object and add to 'items' array
            item = {
                key: cartItem.key,
                line: index + 1, // Shopify uses a 1+ index in the API
                url: cartItem.url,
                img: cartItem.image,
                name: cartItem.product_title,
                variantId: cartItem.variant_id,
                variation: cartItem.variant_title,
                properties: cartItem.properties,
                itemAdd: cartItem.quantity + 1,
                itemMinus: cartItem.quantity - 1,
                itemQty: cartItem.quantity,
                price: Shopify.formatMoney(cartItem.price, settings.moneyFormat),
                type: cartItem.product_type,
                vendor: cartItem.vendor,
                linePrice: Shopify.formatMoney(cartItem.line_price, settings.moneyFormat),
                originalLinePrice: Shopify.formatMoney(cartItem.original_line_price, settings.moneyFormat),
                discounts: cartItem.discounts,
                discountsApplied: cartItem.line_price === cartItem.original_line_price ? false : true
            };

            items.push(item);
        });

        // Gather all cart data and add to DOM
        data = {
            items: items,
            note: cart.note,
            totalPrice: Shopify.formatMoney(cart.total_price, settings.moneyFormat),
            totalCartDiscount: cart.total_discount === 0 ? 0 : {{ 'cart.general.savings_html' | t: price: '[savings]' | json }}.replace('[savings]', Shopify.formatMoney(cart.total_discount, settings.moneyFormat)),
            totalCartDiscountApplied: cart.total_discount === 0 ? false : true
        }
    
        $cartContainer.append(template(data));
  };

    itemErrorCallback = function (XMLHttpRequest, textStatus) {
        var data = eval('(' + XMLHttpRequest.responseText + ')');

        if (!!data.message) {
            if (data.status == 422) {
                $formContainer.after('<div class="errors qty-error">' + data.description + '</div>')
            }
        }
    };

    // helpers

    validateQty = function (qty) {
        if ((parseFloat(qty) == parseInt(qty)) && !isNaN(qty)) {
            // We have a valid number!
        } else {
            // Not a number. Default to 1.
            qty = 1;
        }
        return qty;
    };

    delay = function (ms, data) {
        // delay a jquery deferred object
        var deferred = jQuery.Deferred();

        setTimeout(function () {
            if (!data) {
                deferred.resolve();
            } else {
                deferred.resolve(data)
            }
        }, ms);

        return deferred.promise();
    }

    promisify = function (value) {
        var deferred = jQuery.Deferred();
        return deferred.resolve(value).promise();
    }

    module = {
        init: init,
        load: loadCart
    };

    return module;

}(ajaxCart || {}, jQuery));

jQuery(function ($) {
    ajaxCart.init({
        formSelector: '.product-form',
        cartContainer: '#CartBody',
        addToCartSelector: '.product-form__btn-submit',
        cartCountSelector: '.js-cart-count span',
        cartCostSelector: '#CartCost',
        moneyFormat: {% raw %}'${{amount}}'{% endraw %}
  });
});