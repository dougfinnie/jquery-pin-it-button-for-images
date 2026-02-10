# Building and Testing

## Prerequisites

Node.js (any recent version) for the npm scripts. No other dependencies are required.

## Build commands

```bash
npm run build   # copies src/js/jpibfi.client.js → plugin/js/jpibfi.client.js
npm run zip     # runs build, then produces jquery-pin-it-button-for-images-4.0.0.zip
npm run dev     # watches src/js/ and re-runs build on change (requires inotifywait)
```

The `zip` command produces a `jquery-pin-it-button-for-images-4.0.0.zip` archive containing a
`jquery-pin-it-button-for-images/` directory — the correct structure for WordPress plugin upload.

## Testing with WordPress Playground

[WordPress Playground](https://playground.wordpress.net) lets you spin up a disposable WordPress
instance in the browser with no installation required. It's the fastest way to verify the plugin
works after a change.

1. Run `npm run zip` to produce the zip file.
2. Go to [https://playground.wordpress.net](https://playground.wordpress.net).
3. In the WordPress admin (top bar → **Admin**), navigate to **Plugins → Add New Plugin →
   Upload Plugin**.
4. Choose the zip file and click **Install Now**, then **Activate Plugin**.
5. Create or open a post (**Posts → Add New**), insert an image block, and **Preview** the post.
6. Hover over the image — the Pinterest "Pin It" button should appear.

The Playground instance is discarded when you close the tab, so each test starts clean.

## Local development

For persistent testing against a local WordPress installation, symlink `plugin/` into your
WordPress plugins directory:

```bash
ln -s /path/to/repo/plugin /path/to/wordpress/wp-content/plugins/jquery-pin-it-button-for-images
```

Then activate the plugin in the WordPress admin. Run `npm run build` (or `npm run dev`) after
editing `src/js/jpibfi.client.js` so changes are picked up.
