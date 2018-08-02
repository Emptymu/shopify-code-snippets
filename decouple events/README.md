# Decouple events

```Javascript
// call `offScroll()` or `offResize()` to unbind event listeners
var offScroll = decouple(window, 'scroll', function(evt) {
  console.log('Log scrolling every 1s...');
}, 1000);

var offResize = decouple(window, 'resize', function(evt) {
  console.log('Log Resizng every 2s...');
}, 2000);
```
