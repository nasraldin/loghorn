# LogHorn Examples

This directory contains practical examples demonstrating LogHorn's features and
capabilities.

## 📁 Examples

### 🚀 [edge-runtime-compatibility.js](./edge-runtime-compatibility.js)

Demonstrates LogHorn's compatibility with Next.js Edge Runtime environment.

**Features:**

- Edge Runtime environment simulation
- Basic logging functionality
- Next.js specific methods
- JSON logging in Edge Runtime

**Usage:**

```bash
node edge-runtime-compatibility.js
```

### 🎨 [edge-colors-demo.js](./edge-colors-demo.js)

Shows the optimized color handling for Edge Runtime environments.

**Features:**

- Edge-specific color management
- ANSI color codes for terminal output
- Custom color support
- Hex color mapping
- Color information and CSS generation

**Usage:**

```bash
node edge-colors-demo.js
```

### 📱 [nextjs-app-router-demo.js](./nextjs-app-router-demo.js)

Comprehensive demonstration of Next.js 15 App Router integration.

**Features:**

- App Router specific methods (server/client components)
- Streaming and suspense boundaries
- Parallel routes and intercepting routes
- Data fetching and metadata logging
- Request/response handling
- Performance monitoring
- Dynamic configuration updates
- Legacy method compatibility

**Usage:**

```bash
node nextjs-app-router-demo.js
```

### 📊 [group-logging-demo.js](./group-logging-demo.js)

Demonstrates LogHorn's group logging capabilities.

**Features:**

- Basic group logging
- Collapsed groups
- Async group operations
- Nested groups with context
- Performance tracking within groups

**Usage:**

```bash
node group-logging-demo.js
```

## 🚀 Running Examples

All examples can be run directly with Node.js:

```bash
# Navigate to examples directory
cd examples

# Run any example
node edge-runtime-compatibility.js
node edge-colors-demo.js
node nextjs-app-router-demo.js
node group-logging-demo.js
```

## 📚 What Each Example Teaches

### Edge Runtime Compatibility

- How LogHorn automatically detects Edge Runtime
- Basic logging in serverless environments
- JSON output for production Edge Runtime

### Edge Colors

- Optimized color handling without Node.js APIs
- ANSI escape codes for terminal colors
- Custom color configuration
- Color support detection

### Next.js App Router

- Deep integration with Next.js 15 features
- Component lifecycle logging
- Data fetching and streaming
- Performance monitoring
- Dynamic configuration

### Group Logging

- Organizing related log messages
- Async operations within groups
- Context management
- Performance tracking

## 🔧 Prerequisites

Before running the examples, ensure you have:

1. **Node.js** installed (version 16 or higher)
2. **LogHorn** built and available in `../dist/`
3. **Dependencies** installed (`npm install` in project root)

## 📖 Related Documentation

- **[Quick Start Guide](../docs/QUICK_START.md)** - Get up and running quickly
- **[API Documentation](../docs/API.md)** - Complete API reference
- **[Best Practices](../docs/BEST_PRACTICES.md)** - Guidelines for effective usage
- **[Migration Guide](../docs/MIGRATION.md)** - Migrate from other logging libraries

## 🎯 Use Cases

These examples cover the most common use cases for LogHorn:

- ✅ **Edge Runtime** applications
- ✅ **Next.js 15** App Router projects
- ✅ **Performance monitoring** requirements
- ✅ **Structured logging** needs
- ✅ **Color output** in different environments
- ✅ **Group logging** for complex operations

## 🚀 Next Steps

After exploring these examples:

1. **Integrate** LogHorn into your Next.js project
2. **Configure** for your specific environment
3. **Add** performance monitoring if needed
4. **Customize** colors and formatting
5. **Deploy** to Edge Runtime environments

Happy logging! 🦄
