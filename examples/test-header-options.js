// Test header customization options
const { createLogger } = require('../lib');

console.log('🎛️ Testing Header Customization Options\n');

// Set project context
const logger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
});
logger.setContext({ projectName: 'my-app' });

console.log('📋 Default format:');
logger.info('This is the default format');

console.log('\n🎭 Hide emoji:');
const noEmojiLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showEmoji: false,
});
noEmojiLogger.setContext({ projectName: 'my-app' });
noEmojiLogger.info('This has no emoji');

console.log('\n⏰ Hide timestamp:');
const noTimestampLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showTimestamp: false,
});
noTimestampLogger.setContext({ projectName: 'my-app' });
noTimestampLogger.info('This has no timestamp');

console.log('\n🏷️ Hide level:');
const noLevelLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showLevel: false,
});
noLevelLogger.setContext({ projectName: 'my-app' });
noLevelLogger.info('This has no level');

console.log('\n🏢 Hide project name:');
const noProjectLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showProjectName: false,
});
noProjectLogger.setContext({ projectName: 'my-app' });
noProjectLogger.info('This has no project name');

console.log('\n🚫 Hide entire header:');
const noHeaderLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showHeader: false,
});
noHeaderLogger.setContext({ projectName: 'my-app' });
noHeaderLogger.info('This has no header at all');

console.log('\n✨ Custom combination:');
const customLogger = createLogger({
  enableColors: true,
  enableEmojis: true,
  enableTimestamps: true,
  showEmoji: true,
  showTimestamp: false,
  showLevel: true,
  showProjectName: false,
});
customLogger.setContext({ projectName: 'my-app' });
customLogger.info('Custom format: emoji + level only');
