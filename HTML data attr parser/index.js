theme.parseData = function (str) {
  var obj;
  var arr;

  // Remove spaces before and after delimiters, and both ends
  str = str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',').trim();

  // Parse a string
  arr = str.split(',');

  obj = arr.reduce(function (returnObj, input) {
    input = input.split(':');

    var key = input[0],
        val = input[1];

    // Convert a string value if it is like a boolean
    if (typeof val === 'string' || val instanceof String) {
      val = val === 'true' || (val === 'false' ? false : val);
    }

    // Convert a string value if it is like a number
    if (typeof val === 'string' || val instanceof String) {
      val = !isNaN(val) ? +val : val;
    }

    returnObj[key] = val;

    return returnObj;
  }, {});

  return obj;
}
