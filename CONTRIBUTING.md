# Contributing to BOX Framework

Thank you for your interest in contributing to BOX! This document provides guidelines for contributing.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/box-framework.git
   cd box-framework
   ```

2. Link the CLI for local development:
   ```bash
   npm link
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Test with the example project:
   ```bash
   cd example
   box dev
   ```

## Project Structure

```
box-framework/
├── bin/
│   └── box.js           # CLI entry point
├── lib/
│   ├── commands/        # CLI commands
│   │   ├── init.js
│   │   ├── build.js
│   │   ├── dev.js
│   │   └── add.js
│   ├── compiler/        # Core compiler
│   │   ├── compiler.js  # Main build engine
│   │   ├── parser.js    # .box file parser
│   │   ├── scoper.js    # CSS/JS scoping
│   │   └── minifier.js  # Asset minification
│   ├── server/          # Server utilities
│   │   └── server.js    # Production server
│   └── index.js         # Main library export
├── test/
│   └── test.js          # Test suite
└── example/             # Example project
    └── src/
```

## Code Style

- Use 2-space indentation
- Use single quotes for strings
- Add JSDoc comments for public functions
- Keep functions focused and small

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Add tests for new features
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request

## Reporting Issues

When reporting issues, please include:
- BOX Framework version
- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
