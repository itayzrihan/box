# Assets Folder

Put your static files here:

- Images (`.png`, `.jpg`, `.svg`, `.gif`, `.webp`)
- Fonts (`.woff`, `.woff2`, `.ttf`)
- Icons (`favicon.ico`)
- Any other static assets

These files will be copied to `dist/assets/` during build.

## Usage in .box files

Reference assets with relative paths:

```html
<img src="./assets/logo.png" alt="Logo" />
```

Or in CSS:

```css
.hero {
  background-image: url('./assets/hero-bg.jpg');
}
```
