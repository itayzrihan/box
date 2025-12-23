# 🚀 BOX Project

Welcome to your BOX Framework application! This is a fully functional starter template with examples showing how to:

- Build **reactive components** with state management
- Create **API endpoints** (backend routes)
- Use **component composition** with `<include />`
- Develop with **instant hot-reload** (HMR)

---

## ⚠️ IMPORTANT: Open the Workspace File!

**For proper syntax highlighting in .box files, always open the `.code-workspace` file:**

```bash
code my-box-app.code-workspace
```

Or in VS Code: **File → Open Workspace from File → select `my-box-app.code-workspace`**

> 💡 **AI Assistants:** This project uses `.box` files which are HTML-like components. 
> The workspace file configures VS Code to treat them as HTML with full syntax highlighting and Emmet support.

---

## Quick Start

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** and start building!

## 📁 Project Structure

```
my-box-app/
├── my-box-app.code-workspace  # ⬅️ OPEN THIS FILE in VS Code!
├── box.config.json       # Build configuration
├── src/
│   ├── main.box          # App entry point
│   ├── counter.box       # State management example
│   ├── api-demo.box      # API integration example
│   ├── learning-guide.box # Complete framework guide
│   ├── api+hello.box     # GET /api/hello
│   └── api+echo.box      # POST /api/echo
├── assets/               # Static files (images, fonts)
├── dist/                 # Build output (auto-generated)
├── package.json
└── README.md
```

## 🎯 Development Workflow

1. Edit `.box` files in `src/`
2. Save and browser auto-refreshes
3. See your changes instantly (no build step needed!)
4. Use `npm run build` for production

## 📚 Key Concepts

### .box File Structure

Every `.box` file has three sections:

```html
<style>
  /* Scoped CSS - won't leak to other components */
  .my-class { color: blue; }
</style>

<template>
  <!-- HTML with special attributes -->
  <div class="my-class">
    <span box-bind="count">0</span>
    <include src="./other.box" />
  </div>
</template>

<script>
  // Vanilla JavaScript
  Box.state.count = 42;
</script>
```

### Reactive State

```javascript
// Set state (auto-updates DOM elements with box-bind="count")
Box.state.count = 0;
Box.state.count++;  // UI updates automatically!

// Listen for changes
Box.on('count:changed', (value) => console.log(value));

// Emit custom events
Box.emit('user:login', userData);
```

### API Endpoints

Files named `api+name.box` become routes:

| File | Route |
|------|-------|
| `api+hello.box` | `GET /api/hello` |
| `api+echo.box` | `POST /api/echo` |
| `api+users+list.box` | `GET /api/users/list` |

## 🛠 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run build:analyze` | Build with detailed bundle analysis |
| `npm run build:prod` | Build with aggressive minification |
| `npm run start` | Run production server |
| `npm run preview` | Build and run production |
| `npm run clean` | Remove dist/ and build artifacts |
| `npm run lint` | Validate all .box files for errors |

## 📦 CLI Commands

The BOX CLI offers powerful tools for development:

```bash
# Generate new components
box add ui header        # Create UI component
box add api users        # Create API endpoint
box add page about       # Create full page with SEO meta
box add layout main      # Create layout wrapper

# Development
box dev                  # Start dev server with HMR
box build                # Production build
box build --analyze      # Show bundle analysis
box build --minify=none  # Disable minification

# Maintenance
box clean                # Remove build artifacts
box lint                 # Validate .box files
```

## ⚙️ Configuration

Your project includes `box.config.json` for customization:

```json
{
  "minify": "basic",        // none | basic | aggressive
  "outDir": "dist",
  "srcDir": "src",
  "port": 3000,
  "build": {
    "cleanFirst": false,
    "analyze": false
  }
}
```

## 🔌 VS Code Setup

Your project comes pre-configured with:

- ✅ `.box` files recognized as HTML (syntax highlighting)
- ✅ Emmet support for fast HTML typing
- ✅ Recommended extensions for better DX
- ✅ Debug configurations ready to use

**Open the project folder in VS Code** to activate all settings.

## 🤖 AI-Friendly Code

Copy any `.box` file into Claude, ChatGPT, or your favorite AI assistant.
The pure HTML/CSS/JS structure makes it perfect for AI-assisted development.

### Prompt Template

```
I'm using BOX Framework. Here's my component:

[paste your .box file]

Help me [describe what you want to do].

Note: BOX uses:
- Box.state for reactive state
- box-bind="property" for two-way binding
- <include src="./file.box" /> for composition
- api+name.box files for backend endpoints
```

## 📦 Production Build

```bash
npm run build
```

This generates `dist/` containing:
- `index.html` - Compiled frontend
- `style.css` - Minified styles  
- `app.js` - Minified JavaScript
- `server.js` - Node.js backend server

Deploy `dist/` to any Node.js hosting (Vercel, Railway, Render, etc.)

## 📚 Learn More

- 📖 [BOX Framework GitHub](https://github.com/itayzrihan/box)
- 📦 [npm: @itayzrihan/box-framework](https://www.npmjs.com/package/@itayzrihan/box-framework)

Check the example components in `src/` - they're heavily commented with tips!

---

**Happy Vibe Coding! 🎉**
