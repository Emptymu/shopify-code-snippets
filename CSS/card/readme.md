## A highly reusable/scalable `card component`

`card--overlay` is my mostly used. It works great when you need:
- Background color/Background image with text overlay
- Backdrop for you background
- Different style/display based on breakpoints
- ...

Check out this [example](https://shop.urb-e.com/?fts=0&preview_theme_id=12543754285) to see what I've made with it:
- If you scroll down to the bottom, you will see a two column grid section. They're regular overlay cards(background image with text overlay).
- When you hover on it, you'll notice there are hidden layers (video/text).
- If you resize the browser to under 768px, they become static verticaly stacked cards.

I used a little bit JS to help me play/pause videos and switch classes based on breakpoints. But all the style/animatin is in pure CSS. With Shopify's templating system, this component is very helpful.