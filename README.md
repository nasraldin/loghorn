# loghorn

NPM Package: [loghorn](https://www.npmjs.com/package/loghorn)

## Introduction

Loghorn is a powerful, colorful logging utility for Node.js applications that
provides environment-specific configuration support for both Backend and Frontend
environments. It enables enhanced debugging with customizable, readable, and fancy
logs.

## 🚀 Key Features

- ✅ Environment-specific configuration
- ✅ TypeScript support with strict typing
- ✅ Comprehensive JSON logging support
- ✅ Multiple log levels (Debug, Info, Warn, Error, Trace, Log)
- ✅ Configurable log level restrictions per environment
- ✅ Customizable colors and emojis for each log level
- ✅ Middleware logging support
- ✅ Browser console compatibility
- ✅ Environment variable configuration

## 🛠️ Installation

```bash
# Using npm
npm install loghorn

# Using yarn
yarn add loghorn

# Using pnpm
pnpm add loghorn
```

## 📋 Quick Start

Once installed you import logger or any log method like info, error, etc.. for use:

```typescript
import logger, { info } from 'loghorn';

const info = {
  auther: {
    email: 'ns@nasraldin.com',
    website: 'http://nasraldin.com',
    twitter: 'https://twitter.com/_nasraldin',
  },
  git: 'https://github.com/nasraldin/loghorn',
  npm: 'https://www.npmjs.com/package/loghorn',
};

// Basic logging
logger.log(info);
// or you can print like
logger.log({ info });
logger.debug('Debug information', { details: 'some data' });
logger.info('log info', { info });
logger.warn('log warn', info);
logger.error('log error', info);
logger.fatal('log fatal', info);
logger.trace('log trace', info);
logger.table('log trace', info);

// With middleware options
info('Middleware executed', { data }, { isMiddleware: true });
```

## ⚙️ Configuration

### Environment Variables

Configure loghorn using environment variables:

```bash
# Core settings
ENABLE_LOGS=true
LOG_APP_NAME=loghorn
LOG_LEVEL=trace

# Message template
LOG_MESSAGE_TEMPLATE='{@LogLevel} {@Application} {@Env} at {Timestamp}'

# Output settings
WRITE_LOGS_TO=console,browser
MIDDLEWARE_LOGS=true

# Seq integration (optional)
WRITE_LOGS_TO_SEQ=false
SEQ_URL=http://localhost:5341/api/events/raw
SEQ_API_KEY=api_key

# For Next.js applications you can append NEXT_PUBLIC_ to the config name
NEXT_PUBLIC_LOG_APP_NAME=loghorn
```

## 🔍 Log Levels

Available log levels in order of severity:

- TRACE - Detailed debugging information
- DEBUG - Debugging messages
- INFO - General information
- WARN - Warning messages
- ERROR - Error conditions
- FATAL - Critical errors that require immediate attention

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of
conduct before submitting pull requests.

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## 📝 License

See [LICENSE](./LICENSE) for more information.

## Authors

- Nasr Aldin ([@nasraldin](https://github.com/nasraldin))
