/**
 * Local Storage Helper
 * --------------------------
 */

theme.Storage = (function() {
  
  var set = function(key, value, expiration) {
    var _value = {
      value: value,
      expiration: expiration,
      createdAt: new Date()
    };

    localStorage.setItem(key, JSON.stringify(_value));
  };

  var get = function(key) {
    // _value saved as string
    var _valueRaw = localStorage.getItem(key);

    if(!_valueRaw) {
      // when item doesn't exist 
      console.log("Item doesn't exist!");
      return undefined;
    }else {
      // when item exist
      var _value = JSON.parse(_valueRaw);

      if(!_value.expiration ) {
        // if doesn't have an expiration date
        return _value.value;
      }else {
        // check expiration
        if (new Date(_value.expiration) > new Date()) {
          return _value.value;
        }else {
          this.remove(key);
          console.log('This item is expired!');
          return undefined;
        }
      }
    };
  }

  var remove = function(key) {
    return localStorage.removeItem(key);
  }

  var checkExpiration = function(key) {
    // _value saved as string
    var _valueRaw = localStorage.getItem(key);

    if (!_valueRaw) {
      console.log("Item doesn't exist!");
      return undefined;
    }else {
      var expiration = JSON.parse(_valueRaw).expiration;
      if(!expiration) {
        console.log("This item doesn't have expiration date!");
        return undefined;
      }else {
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