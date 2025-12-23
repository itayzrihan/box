# Changelog

All notable changes to BOX Framework will be documented in this file.

## [1.0.0] - 2024-12-23

### Added
- Initial release of BOX Framework
- `.box` file format for UI components and API endpoints
- Core compiler with dependency resolution and tree shaking
- CSS scoping with automatic attribute injection
- JavaScript isolation with IIFE wrapping
- Reactive state management with Proxy-based `Box.state`
- Two-way data binding with `box-bind` attribute
- Event system with `Box.on()` and `Box.emit()`
- Built-in API client with `Box.api()`
- CLI tools: `box init`, `box dev`, `box build`, `box add`
- Development server with Hot Module Replacement (HMR)
- Pure Node.js production server
- Docker support for deployment
- VS Code integration with syntax highlighting and snippets
- Comprehensive documentation

### Technical Specifications
- Zero runtime dependencies in production build
- Sub-1KB reactive runtime
- Native HTML/CSS/JS output
- Full-stack support (frontend + API in one format)
