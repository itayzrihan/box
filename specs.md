This is the Official Master Blueprint for the BOX Framework. It outlines the architecture, the technical specifications, and the logic of the "Box Engine" that turns modular components into a high-performance, production-ready application.📦 BOX Framework: The Master Blueprint (v1.0)Concept: A zero-dependency, full-stack framework based on "Atomic Boxes." It uses pure Vanilla Web technologies (HTML/CSS/JS) with a smart compiler to handle modularity.1. The .box File SpecificationA .box file is an autonomous unit. It encapsulates structure, style, and logic without needing a complex runtime.A. The UI Box (e.g., nav.box)Used for frontend components.HTML<style>
  .nav-link { color: #007bff; font-weight: 500; transition: 0.3s; }
  .nav-link:hover { color: #0056b3; }
</style>

<template>
  <nav class="box-wrapper">
    <a href="/" class="nav-link">Home</a>
    <span box-bind="username">Loading...</span>
  </nav>
</template>

<script>
  // Local logic
  console.log("Navigation Box initialized");
  
  // Reacting to global state
  Box.on('username:update', (newName) => {
    console.log("Greeting new user:", newName);
  });
</script>
B. The API Box (e.g., api+get-users.box)Used for backend Node.js endpoints.JavaScript/* BOX_CONFIG: { method: 'GET', auth: true } */

export default async (req, res, context) => {
  try {
    const users = [{ id: 1, name: "Itay" }, { id: 2, name: "Developer" }];
    return { status: 200, data: users };
  } catch (err) {
    return { status: 500, error: "Database failure" };
  }
};
2. The Box Engine (Compiler) ArchitectureThe compiler (box-build.js) is a lightweight Node.js script that processes your files in four distinct stages.Stage 1: Dependency Crawling (Tree Shaking)The compiler starts at main.box. It looks for <include src="filename.box"> tags. It recursively builds a "Dependency Map."Benefit: Any .box file sitting in your folder that isn't explicitly "included" will be ignored, keeping the final build tiny.Stage 2: Attribute-Based Scoping (Collision Prevention)To prevent CSS and JS name collisions, the compiler generates a unique Box-ID (e.g., bx-928) for every file.CSS: It prepends the ID to every selector: [data-box="bx-928"] .btn { ... }.HTML: It wraps the template in a div with that ID: <div data-box="bx-928"> ... </div>.JS: It wraps the script in a block scope { ... } to keep variables local.Stage 3: Reactive State InjectionThe compiler injects a tiny (sub-1KB) runtime into the final JS file. This runtime uses a JS Proxy to handle data binding.JavaScriptconst Box = {
  state: new Proxy({}, {
    set(target, key, value) {
      target[key] = value;
      // Automatically updates any HTML element with box-bind="key"
      document.querySelectorAll(`[box-bind="${key}"]`).forEach(el => el.innerText = value);
      return true;
    }
  })
};
3. Solving the 5 Core ChallengesChallengeBOX Technical Solution1. CollisionsAutomatic Scoping: Attributes for CSS and Block Scopes for JS.2. ToolingEditor Mapping: Mapping .box to html syntax via .vscode/settings.json.3. StateProxy-Sync: Direct DOM manipulation triggered by state changes (No Virtual DOM).4. Tree ShakingRecursive Inclusion: Only compiling files that are linked to main.box.5. API SecurityThe Wrapper: Every API Box is executed inside a try/catch wrapper with auto-sanitization.4. The Build Pipeline (The Output)When you run node box-build, the engine generates a /dist folder:index.html: The master file containing all stitched HTML segments.style.css: All scoped CSS from all boxes concatenated.app.js: All scoped JS logic + the Box State Runtime.server.js: A pure Node.js server that dynamically routes api+ files to URL paths (e.g., api+users.box becomes /api/users).5. Developer Workflowbox dev: Starts a local server with a "watcher." Every time you save a .box file, the browser refreshes instantly.box add [name]: Generates a boilerplate .box file with <style>, <template>, and <script> sections.box build: Compresses and minifies the files for production.Why this is a Game Changer:AI-Native: Since the logic is pure HTML/JS/CSS, AI assistants can write perfect code for it without getting confused by framework-specific "magic."Zero-Maintenance: No node_modules in the production build. It runs on any server forever.Performance: There is no "middleman" (no React, no Vue). It's as fast as the browser can possibly render.


This is the Technical Specification Document (TSD) for the BOX Framework (v1.0). This document serves as the single source of truth for the development, implementation, and standardization of the framework.BOX Framework: Technical Specification1. OverviewBOX is a minimalist, component-oriented, full-stack framework designed for Vanilla Web Development. It eliminates framework overhead by using a build-time "Stitcher" that compiles modular .box files into high-performance, standard HTML/CSS/JS.1.1 Core PrinciplesZero Runtime Dependencies: No external libraries required in production.Native-First: Standard web technologies only (HTML5, CSS3, ES6+).Encapsulation by Injection: Scoping is handled via attribute injection rather than Shadow DOM.Vibe-Coding Optimized: Simplified structure for maximum compatibility with AI-assisted coding.2. File Specifications2.1 The UI Box ([name].box)A UI Box file is a single-file component consisting of three distinct blocks.BlockTagPurposeStyle<style>Scoped CSS rules for the component.Template<template>The HTML structure.Script<script>Local logic executed within a block scope.2.2 The API Box (api+[name].box)An API Box file contains backend Node.js logic.Naming Convention: Must start with the api+ prefix.Default Export: Must export an async function (req, res, ctx).Config Header: Optional metadata block at the top of the file using JSDoc or JSON comments.3. The Build Engine (box-build)The build process is a non-destructive, additive compiler.3.1 Scoping MechanismTo ensure isolation, the compiler performs the following:ID Generation: A hash (e.g., _bx123) is generated based on the filename.HTML Injection: The root element within the <template> receives a data-box="[ID]" attribute.CSS Rewriting: Every selector in the <style> block is prepended with [data-box="[ID]"].JS Isolation: The contents of <script> are wrapped in an Immediately Invoked Function Expression (IIFE) or a block { }.3.2 Dependency ResolutionEntry Point: main.box.Include Tag: Components are imported using <include src="./path/to/file.box">.Tree Shaking: Files in the project directory that are not reached via the main.box inclusion tree are excluded from the /dist output.4. State Management (The Box Runtime)A lightweight runtime (box-runtime.js) is injected into the final bundle to handle reactivity.4.1 Global State ProxyJavaScriptconst Box = {
  state: new Proxy({}, {
    set(target, key, value) {
      target[key] = value;
      // DOM Update: Logic to find elements with box-bind="key"
      document.querySelectorAll(`[box-bind="${key}"]`).forEach(el => {
        if (el.tagName === 'INPUT') el.value = value;
        else el.innerText = value;
      });
      return true;
    }
  })
};
5. API ArchitectureThe BOX backend is a pure Node.js HTTP server mapping files to routes.Routing: api+users.box → POST /api/users.Middleware: The engine wraps every endpoint in a standard handler that provides:Automatic JSON parsing for POST/PUT.Query parameter extraction.Standardized Error Catching (Global try/catch).6. Directory StructurePlaintext/project-root
├── .vscode/             # Tooling config
│   └── settings.json    # Mapping .box to HTML
├── src/
│   ├── main.box         # App Entry Point
│   ├── header.box
│   ├── footer.box
│   └── api+login.box    # Auth Endpoint
├── assets/              # Static files (images, fonts)
└── dist/                # Production Output (Auto-generated)
    ├── index.html
    ├── style.css
    ├── app.js
    └── server.js
7. CLI SpecificationsCommandActionbox initScaffolds a new BOX project with recommended directory structure.box devRuns a local development server with Hot Module Replacement (HMR).box buildCompiles the src into the dist folder, minifying JS and CSS.box add [type] [name]Generates a boilerplate .box file (ui or api).8. Development Environment (IDE Support)To enable full IDE support without custom plugins:File Association: Map *.box to html syntax highlighting.Emmet Support: Enable Emmet for .box files to allow rapid HTML expansion.Snippets: Provide a box-component snippet for generating the <style>/<template>/<script> scaffold.

This is your Roadmap to BOX. Since you are focused on "Vibe Coding" and efficiency, I’ve broken this down into five logical phases. Completing these will take you from a concept to a functional, distributable framework.

Phase 1: The Core Compiler (The "Stitcher")
Goal: Create a script that can read .box files and turn them into a single index.html.

[ ] Task 1.1: Build the File Crawler. Write a Node.js script that recursively reads the src folder for any .box files.

[ ] Task 1.2: Implement Regex Parsing. Create functions to extract content between <style>, <template>, and <script> tags.

[ ] Task 1.3: Create the Dependency Resolver. Implement the <include src="..."> logic so the compiler knows the order in which to stitch components.

[ ] Task 1.4: Generate the Static Output. Save the combined result into a dist/ folder.

Phase 2: The Scoping & State Engine
Goal: Prevent CSS/JS collisions and make the UI reactive.

[ ] Task 2.1: Develop the ID Generator. Assign a unique 5-character hash to every .box file during the build.

[ ] Task 2.2: Build the CSS Scoper. Use the compiler to prepend the unique ID to every CSS selector found in <style> blocks.

[ ] Task 2.3: Implement HTML Attribute Injection. Automatically add data-box="[ID]" to the root element of every <template>.

[ ] Task 2.4: Write the Box Runtime (1KB). Create the Box.state Proxy object that listens for changes and updates elements with box-bind attributes.

Phase 3: The API & Server Layer
Goal: Enable the api+ files to function as live endpoints.

[ ] Task 3.1: Create the Pure Node Server. Write a server.js template that uses the built-in http module.

[ ] Task 3.2: Develop Dynamic Routing. The compiler must scan for api+*.box files and map them to server routes (e.g., api+users.box -> /api/users).

[ ] Task 3.3: Build the API Wrapper. Ensure every endpoint is wrapped in a try/catch block and can handle JSON body parsing by default.

Phase 4: Developer Experience (DX) & CLI
Goal: Make BOX easy to use and "Vibe" with.

[ ] Task 4.1: Build the BOX CLI. Create a bin entry point so you can run box build from the terminal.

[ ] Task 4.2: Implement the Watcher (Dev Mode). Use fs.watch to trigger a re-build and a browser refresh whenever a .box file is saved.

[ ] Task 4.3: Create VS Code Integration. Generate the .vscode/settings.json file automatically during box init to ensure syntax highlighting works immediately.

[ ] Task 4.4: Write Boilerplate Snippets. Create a set of "Starter Boxes" (Header, Hero, Footer) to demo the framework.

Phase 5: Deployment & Distribution
Goal: Get BOX into production (Dokploy/VPS).

[ ] Task 5.1: Optimize the Build Process. Add basic minification for the final CSS and JS files in the dist folder.

[ ] Task 5.2: Create a Production Dockerfile. Write a lightweight Docker config that serves the dist folder and runs the server.js.

[ ] Task 5.3: Document the "BOX Standard". Write a README that explains to other developers (or your AI assistant) how to structure a new Box.