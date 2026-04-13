# WordPress image test snippets (jQuery Pin It Button for Images)

Use these to exercise **multiline `<img>`**, **featured-style fragments**, **links**, **duplicates**, and **Pinterest-style data attributes**. Image URLs use [picsum.photos](https://picsum.photos/) (replace with your own media URLs if your host blocks remote images).

## How to paste

### Option A — whole page in the block editor (recommended)

1. Create a **Page** or **Post** → save draft.
2. Open the **⋮** menu → **Code editor** (not “Edit as HTML” on a single block).
3. Replace everything with **one** of the full-document examples below (from `<!-- wp:html -->` through `<!-- /wp:html -->`, or the multi-block examples).
4. Switch back to **Visual editor** and **Preview** the front of the site.

### Option B — one snippet at a time

1. Add a **Custom HTML** block.
2. Paste only the **inner** HTML (inside the `<!-- wp:html -->` … `<!-- /wp:html -->` wrapper), i.e. the `<figure>`, `<p>`, `<img>`… markup.

---

## Full page 1 — “Happy path” (single line + short copy)

```html
<!-- wp:paragraph -->
<p>Single-line image; Pin It should appear on hover if the image meets your size and class rules.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<figure class="wp-block-image size-large"><img src="https://picsum.photos/seed/jpibfi-line/800/500" alt="Single-line img" class="wp-image-1" width="800" height="500"/></figure>
<!-- /wp:html -->
```

---

## Full page 2 — “Block editor shape” (line breaks inside `<img>`)

This matches common **pretty-printed** markup. If attributes were dropped here, the image would show broken or empty `src`.

```html
<!-- wp:paragraph -->
<p>Multiline <code>&lt;img&gt;</code> (newlines/tabs between attributes). Hover for Pin It.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<figure class="wp-block-image">
<img
	loading="lazy"
	decoding="async"
	width="640"
	height="480"
	src="https://picsum.photos/seed/jpibfi-multi/640/480"
	class="wp-image-999 size-full"
	alt="Multiline attributes test"
/>
</figure>
<!-- /wp:html -->
```

---

## Full page 3 — “Two similar images” (different `src`, same class pattern)

Checks that **each** `<img>` keeps its own `src` after server-side attribute injection (no duplicate-fragment mix-up).

```html
<!-- wp:paragraph -->
<p>Two images with the same <code>class</code> pattern but different <code>src</code>. Each should pin the correct image.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<p>
<img src="https://picsum.photos/seed/jpibfi-dup-a/320/240" class="alignnone size-medium" alt="First" width="320" height="240" />
<img src="https://picsum.photos/seed/jpibfi-dup-b/320/240" class="alignnone size-medium" alt="Second" width="320" height="240" />
</p>
<!-- /wp:html -->
```

---

## Full page 4 — “Linked image” (`pin linked URL` option)

Replace `https://yoursite.example/` with a URL on **your** WordPress site if you want to test “use link href as pin URL” for same-host links.

```html
<!-- wp:paragraph -->
<p>Image wrapped in a link. Useful for testing “pin linked URL” behavior in plugin settings.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<p><a href="https://yoursite.example/sample-page/"><img src="https://picsum.photos/seed/jpibfi-linked/500/333" alt="Inside link" width="500" height="333" /></a></p>
<!-- /wp:html -->
```

---

## Full page 5 — “Native Pinterest attributes” (client script supports these)

The front-end script reads `data-pin-media`, `data-pin-url`, and `data-pin-description` when present.

```html
<!-- wp:paragraph -->
<p>Optional Pinterest-native attributes (hover to pin).</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<img
	src="https://picsum.photos/seed/jpibfi-pinattrs/400/300"
	alt="Room"
	data-pin-media="https://picsum.photos/seed/jpibfi-pinattrs-full/1200/900"
	data-pin-url="https://yoursite.example/"
	data-pin-description="From data-pin-description"
	width="400"
	height="300"
/>
<!-- /wp:html -->
```

---

## Featured image note

The plugin also filters **`post_thumbnail_html`**. Your theme’s featured image is not edited in the post body; test it by setting a **Featured image** on any of these posts and viewing a template that shows it (single post header, archive card, etc.). The live plugin should **not** inject the hidden `.jpibfi` input into that thumbnail HTML (only into full `the_content`).

---

## Optional: `srcset` / `sizes` (manual)

WordPress often outputs `srcset` and `sizes` on the front. You can paste a **Custom HTML** block with markup copied from **View source** on a real Media Library image on your site if you need to test responsive URLs end-to-end; remote placeholders rarely match your uploads’ `srcset` structure.
