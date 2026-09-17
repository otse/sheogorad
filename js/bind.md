# bind.js

Fills a cloned `<template>` with data using `data-bind-*` attributes declared
in the HTML, so call sites never need `querySelector` to poke values in.

```js
import { bindTemplate } from './bind.js';

const clone = someTemplate.content.cloneNode(true);
bindTemplate(clone, data);
```

## Attributes

| Attribute | Effect | Example |
|---|---|---|
| `data-bind="path"` | sets `textContent` | `data-bind="level"` |
| `data-bind-html="path"` | sets `innerHTML` (trusted content only) | `data-bind-html="bio"` |
| `data-bind-attr="attr:path, attr2:path2"` | sets one or more attributes | `data-bind-attr="title:tooltip"` |
| `data-bind-style="prop:path, prop2:path2"` | sets one or more inline style props | `data-bind-style="width:life.percent"` |

`path` supports dot-notation for nested data (`attributes.strength`).
Paths that resolve to `undefined` are left untouched — partial data won't blank out unrelated fields, existing placeholder content just stays as a fallback.

## Example

```html
<template id="npc-wnd-template">
  <span data-bind="race">Dark Elf</span>
  <div class="rn-stat-bar-fill" data-bind-style="width:life.percent"></div>
</template>
```

```js
bindTemplate(clone, {
  race: 'High Elf',
  life: { percent: '78%' },
});
```

See `js/npc.js` for a full usage example.
