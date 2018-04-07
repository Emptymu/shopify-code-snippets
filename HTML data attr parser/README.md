# HTML Data Attribute Parser

Based on:

- https://github.com/vodkabears/Remodal

- https://github.com/lodash/lodash/issues/2718

Example usage:

```html
<div class="slideshow"
     data-slideshow-settings="
        slideToShow: 1,
        slideToScroll: 1
     "
     >
    <div class="slideshow__slide"></div>
    <div class="slideshow__slide"></div>
    <div class="slideshow__slide"></div>
</div>
```

```javascript
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

var settings = {
    accessibility: true,
    autoplay: false,
    arrows: true,
    infinite: true,
    dots: this.slideSettings.showDots,
    speed: 300,
    slidesToShow: this.slideSettings.slidesToShow,
    slidesToScroll: this.slideSettings.slidesToScroll
};

// Parse settings
var customSettings = theme.parseData($('.slideshow').data('slideshowSettings'));

// extend settings
$.extend(settings, customSettings);

// init slider
$('.slideshow').slick(settings);
```
