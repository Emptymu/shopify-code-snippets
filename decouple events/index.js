/**
 * Decouple Event Helper
 * --------------------------
 * https://github.com/pazguille/decouple
 * Modified event binder, added a variable to check if it's animation
 */

 theme.Decouple = (function() {
    var requestAnimFrame = (function() {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    }().bind(window));
    
    var decouple = function(node, event, fn, isAnimation) {
      var eve,
          tracking = false;

      function captureEvent(e) {
        eve = e;
        track();
      }

      function track() {
        if (!tracking) {
          if (isAnimation == false) {
            window.setTimeout(update, 500);
          }else {
            requestAnimFrame(update);
          }
          
          tracking = true;
        }
      }

      function update() {
        fn.call(node, eve);
        tracking = false;
      }

      node.addEventListener(event, captureEvent, false);

      return captureEvent;
    }

    return decouple;
 })();