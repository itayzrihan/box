# 📦 BOX Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/itayzrihan/box.svg)](https://github.com/itayzrihan/box/stargazers)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> A zero-dependency, full-stack framework based on Atomic Boxes

BOX is a minimalist, component-oriented framework designed for **Vanilla Web Development**. It eliminates framework overhead by using a build-time "Stitcher" that compiles modular `.box` files into high-performance, standard HTML/CSS/JS.

## ✨ Features

- **Zero Runtime Dependencies** - No external libraries required in production
- **Native-First** - Standard web technologies only (HTML5, CSS3, ES6+)
- **Encapsulation by Injection** - Scoping via attributes, not Shadow DOM
- **AI-Native** - Pure HTML/JS/CSS that AI assistants can write perfectly
- **Full-Stack** - Frontend components + Backend API endpoints in one format

## 🚀 Quick Start

### Using NPX (Recommended)

```bash
# Create a new project with one command
npx @itayzrihan/create-box-app my-app
cd my-app
npm install
npm run dev

# Open http://localhost:3000
```

### Using npm Install

```bash
# Install framework globally
npm install -g @itayzrihan/box-framework

# Create a new project
mkdir my-app && cd my-app
box init

# Start development server
box dev

# Open http://localhost:3000
```

## 📦 npm Packages

- **[@itayzrihan/box-framework](https://www.npmjs.com/package/@itayzrihan/box-framework)** - The core framework and CLI
- **[@itayzrihan/create-box-app](https://www.npmjs.com/package/@itayzrihan/create-box-app)** - Project scaffolding tool

## 📁 Project Structure

```
my-app/
├── .vscode/
│   └── settings.json     # IDE configuration
├── src/
│   ├── main.box          # App entry point
│   ├── header.box        # Header component
│   ├── footer.box        # Footer component
│   └── api+users.box     # API endpoint
├── assets/               # Static files
└── dist/                 # Build output
    ├── index.html
    ├── style.css
    ├── app.js
    └── server.js
```

## 📄 The .box File Format

### UI Box (Components)

```html
<style>
  .my-component {
    padding: 1rem;
    background: #f0f0f0;
  }
</style>

<template>
  <div class="my-component">
    <h1>Hello, <span box-bind="username">Guest</span>!</h1>
    <include src="./child-component.box" />
  </div>
</template>

<script>
  // Component logic
  Box.state.username = 'World';
  
  // Event handling
  Box.on('username:update', (newValue) => {
    console.log('Username changed to:', newValue);
  });
</script>
```

### API Box (Backend Endpoints)

```javascript
/* BOX_CONFIG: { "method": "GET", "auth": true } */

export default async (req, res, context) => {
  try {
    const users = await fetchUsers();
    return { status: 200, data: users };
  } catch (err) {
    return { status: 500, error: "Database error" };
  }
};
```

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `box init` | Scaffold a new BOX project |
| `box dev` | Start dev server with HMR |
| `box build` | Compile for production |
| `box add ui <name>` | Create a UI component |
| `box add api <name>` | Create an API endpoint |

## 🎯 Core Concepts

### 1. Reactive State

BOX uses a Proxy-based state system for automatic DOM updates:

```javascript
// Set state
Box.state.count = 0;

// Elements with box-bind="count" auto-update
Box.state.count++;

// Listen for changes
Box.on('count:update', (newVal, oldVal) => {
  console.log(`Count: ${oldVal} → ${newVal}`);
});
```

### 2. Data Binding

Bind elements to state with the `box-bind` attribute:

```html
<span box-bind="username">Loading...</span>
<input type="text" box-bind="searchQuery" />
```

### 3. Component Inclusion

Include components with the `<include>` tag:

```html
<include src="./header.box" />
<include src="./components/card.box" />
```

### 4. Scoped Styles

Styles are automatically scoped to prevent collisions:

```css
/* Written */
.button { color: blue; }

/* Compiled */
[data-box="bx-a1b2c"] .button { color: blue; }
```

### 5. API Endpoints

Create backend endpoints with the `api+` prefix:

```
api+users.box      → GET  /api/users
api+post-users.box → POST /api/users
api+get-user-id.box → GET /api/user/id
```

## 🏭 Production Deployment

### Build for Production

```bash
box build
```

### Run with Node.js

```bash
cd dist
node server.js
```

### Run with Docker

```bash
docker build -t my-box-app .
docker run -p 3000:3000 my-box-app
```

## 📚 Box Runtime API

### State Management

```javascript
// Set state (triggers DOM update)
Box.state.key = value;

// Get state
const value = Box.state.key;
```

### Events

```javascript
// Subscribe to state changes
const unsubscribe = Box.on('key:update', (newVal, oldVal) => {
  // Handle change
});

// Unsubscribe
unsubscribe();

// Emit custom events
Box.emit('custom-event', data);
```

### API Calls

```javascript
// GET request
const users = await Box.api('users');

// POST request
const result = await Box.api('users', {
  method: 'POST',
  body: { name: 'John' }
});
```

## 🛠 IDE Support

BOX automatically configures VS Code for syntax highlighting:

```json
// .vscode/settings.json
{
  "files.associations": {
    "*.box": "html"
  },
  "emmet.includeLanguages": {
    "box": "html"
  }
}
```

## 📜 License

MIT © [Itay Zrihan](https://github.com/itayzrihan)

---

**Built with ♥ for the Vanilla Web**

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details.

## 🔗 Links

- [GitHub Repository](https://github.com/itayzrihan/box)
- [Issue Tracker](https://github.com/itayzrihan/box/issues)
- [Changelog](CHANGELOG.md)
