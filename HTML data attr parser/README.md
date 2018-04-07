# HTML Data Attribute Parser

Based on:

- https://github.com/vodkabears/Remodal
- https://github.com/lodash/lodash/issues/2718

Parse `"key: value, key: value..."` and return `object`.

`theme.parseData("foo: 1, bar: 2")` returns `{ foo:1, bar:2 }`

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
