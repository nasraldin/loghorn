# loghorn

NPM Package: [loghorn](https://www.npmjs.com/package/loghorn)

## Introduction

A robust and type-safe configuration loader for Node.js applications with support
for environment-specific configs, validation, and caching. Compatible with both
Backend and Frontend environments.

quickload organizes hierarchical configurations for your app deployments by letting
you define a set of default parameters and extend them for different deployment
environments (development, production, test, etc.).

## ⚠️ Development Status

This library is under active development. Some features are still being implemented
or refined.

### Available Features

- ✅ Environment-specific configuration management
- ✅ TypeScript support with strict typing
- ✅ JSON Schema validation using Ajv (Coming soon)
- ✅ Basic configuration loading
- ✅ Environment variable support
- ✅ Multiple environment support (development, production, test, staging)
- ✅ Configuration caching for performance optimization
- ✅ Deep merging of configuration objects

### Features In Development

- 🚧 Multiple file format support (YAML)
- 🚧 Configuration watching and hot reload
- 🚧 Custom configuration sources
- 🚧 Secure secrets management

## Features

- ✨ Environment-specific configuration management
- 🛡️ JSON Schema validation using Ajv
- 🚀 Configuration caching for performance optimization
- 🔄 Deep merging of configuration objects
- ⚡ Async/Promise-based operations
- 📘 TypeScript support with strict typing
- 🎯 Comprehensive error handling
- 🔍 Environment variable interpolation
- 📁 Multiple file format support (JSON, YAML, JS/TS)
- 🔒 Secure secrets management
- 🎨 Custom configuration sources

## Installation

```bash
# Using npm
npm install quickload

# Using yarn
yarn add quickload

# Using pnpm
pnpm add quickload
```

## Directory Structure

```bash
project/
├── config/
│   ├── default/           # Base configuration
│   │   ├── app.json
│   │   └── database.json
│   ├── development/       # Development overrides
│   │   ├── app.json
│   │   └── database.json
│   ├── production/        # Production overrides
│   │   ├── app.json
│   │   └── database.json
│   └── test/             # Test environment overrides
       ├── app.json
       └── database.json
```

## Basic Usage

1. Define Your Configuration Files

```json
// config/default/app.json
{
  "name": "my-app",
  "port": 3000,
  "logLevel": "info",
  "api": {
    "timeout": 5000,
    "retries": 3
  }
}

// config/default/database.json
{
  "host": "localhost",
  "port": 5432,
  "database": "myapp",
  "pool": {
    "min": 2,
    "max": 10
  }
}

// config/production/database.json
{
  "host": "prod-db.example.com",
  "pool": {
    "max": 20
  }
}
```

2. Type-Safe Configuration

```typescript
// types/config.ts
interface AppConfig {
  name: string;
  port: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  api: {
    timeout: number;
    retries: number;
  };
  database: {
    host: string;
    port: number;
    database: string;
    pool: {
      min: number;
      max: number;
    };
  };
}

// Schema validation
const configSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    port: { type: 'number', minimum: 1024 },
    logLevel: {
      type: 'string',
      enum: ['debug', 'info', 'warn', 'error'],
    },
    api: {
      type: 'object',
      properties: {
        timeout: { type: 'number', minimum: 0 },
        retries: { type: 'number', minimum: 0 },
      },
      required: ['timeout', 'retries'],
    },
    database: {
      type: 'object',
      properties: {
        host: { type: 'string' },
        port: { type: 'number', minimum: 1, maximum: 65535 },
        database: { type: 'string' },
        pool: {
          type: 'object',
          properties: {
            min: { type: 'number', minimum: 0 },
            max: { type: 'number', minimum: 1 },
          },
          required: ['min', 'max'],
        },
      },
      required: ['host', 'port', 'database', 'pool'],
    },
  },
  required: ['name', 'port', 'logLevel', 'api', 'database'],
} as const;
```

3. Loading Configuration

```typescript
import { ConfigLoaderOptions, loadConfig } from 'quickload';

async function initializeConfig(): Promise<AppConfig> {
  const options: ConfigLoaderOptions = {
    schema: configSchema,
    configDir: './config',
    cache: true,
    env: process.env.NODE_ENV || 'development',
    // Optional: Custom environment variable prefix
    envPrefix: 'MYAPP_',
    // Optional: Custom file patterns
    patterns: ['*.json', '*.yaml'],
  };

  try {
    const config = await loadConfig(options);
    return config as AppConfig;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error('Configuration error:', error.message);
      console.error('Validation errors:', error.errors);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Usage in your application
const config = await initializeConfig();
console.log(`Starting ${config.name} on port ${config.port}`);
```

4. Environment Variables Override (In Development)

quickload supports environment variable overrides using a specific format:

```bash
# Override configuration values using environment variables
MYAPP_PORT=8080
MYAPP_DATABASE__HOST=custom-db.example.com
MYAPP_API__TIMEOUT=10000
```

5. Advanced Features

Custom Configuration Sources

```ts
import { ConfigSource } from 'quickload';

class RemoteConfigSource implements ConfigSource {
  async load() {
    // Implement remote configuration fetching
    return await fetchRemoteConfig();
  }
}

const options: ConfigLoaderOptions = {
  sources: [
    new FileConfigSource(),
    new RemoteConfigSource(),
    new EnvironmentConfigSource(),
  ],
};
```

Configuration Watching (In Development)

```ts
const config = await loadConfig({
  ...options,
  watch: true,
  onChange: (newConfig) => {
    console.log('Configuration updated:', newConfig);
  },
});
```

## Error Handling

The library provides detailed error information:

```ts
try {
  const config = await loadConfig(options);
} catch (error) {
  if (error instanceof ConfigurationError) {
    // Handle validation errors
    error.errors.forEach((err) => {
      console.error(`Validation error at ${err.path}: ${err.message}`);
    });
  } else if (error instanceof FileNotFoundError) {
    console.error('Configuration file not found:', error.path);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Known Limitations

- Hot reload feature is not yet available
- YAML support is under development

## Best Practices

- Always use TypeScript interfaces for type safety
- Implement validation schemas for runtime safety
- Use environment-specific configurations sparingly
- Keep sensitive information in environment variables
- Enable caching in production environments
- Implement proper error handling
- Use meaningful configuration grouping

## Contributing

Contributions are always welcome!

Please follow our [contributing guidelines](./CONTRIBUTING.md).

Please adhere to this project's [CODE_OF_CONDUCT](./CODE_OF_CONDUCT.md).

Please take a moment to review this document before submitting your first pull
request. We also strongly recommend that you check for open issues and pull requests
to see if someone else is working on something similar.

## 📝 License

See [LICENSE](./LICENSE) for more information.

## Authors

- Nasr Aldin ([@nasraldin](https://github.com/nasraldin))
