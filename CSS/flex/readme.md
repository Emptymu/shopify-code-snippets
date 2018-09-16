## A bunch of CSS flex box `mixins` and `helper classes` to speed up daily production.

e.g.

```html
<!-- Display flex using helper class -->
<div class="flex">
  <div></div>
  <div></div>
</div>

```

```SCSS
// Display flex using mixin
.foo {
  @include display-flex();
}

// Display flex and direction column using helper class
.bar {
  @extend .flex--column;
}
```