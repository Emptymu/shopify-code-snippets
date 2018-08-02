/**
 * Decouple event listener
 * @param {HTMLElement}           node     - The DOM element you want to bind the event listener
 * @param {String}                event    - A JS event
 * @param {Function}              fn       - Listener
 * @param {Number|Undefined|Null} debounce - The debounce time, if `Undefined` or `Null`, the listener will be a callback of request animation frame
 * @returns {Function}
 */

function decouple(node, event, fn, debounce) {
  // Private variables
  var _isAnimation = debounce ? false : true;
  var _tracking = false;

  /**
   * Define _requestAnimFrame
   * Use setTimeOut as a fallback if requestAnimationFrame and webkitRequestAnimationFrame doesn't exist
   */
  var _requestAnimFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })().bind(window);

  /**
   * Check if its tracking
   * - If not, listen for animation frame or timeout to run `_fire` and set `_tracking` to be true
   * - If yes, do nothing
   * @param {Object} evt - JS Event object
   */
  function _track(evt) {
    if (!_tracking) {
      _isAnimation
        ? _requestAnimFrame(_fire.bind(evt))
        : window.setTimeout(_fire.bind(evt), debounce);
      _tracking = true;
    }
  }

  /**
   * Fire the actually listener with `node` as context and `evt` as a parameter
   * Then set `_tracking` to be false
   */
  function _fire() {
    fn.call(node, this);
    _tracking = false;
  }

  /**
   * Remove event listener
   */
  function _off() {
    node.removeEventListener(event, _track);
  }

  // Bind event listener
  node.addEventListener(event, _track, false);

  return _off;
}
