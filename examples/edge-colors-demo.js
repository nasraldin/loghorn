// Edge Runtime Color Handling Example
// This demonstrates the optimized color handling for Edge Runtime environments

// Mock Edge Runtime environment
globalThis.EdgeRuntime = 'edge-runtime';

const { EdgeColorManager } = require('../dist/utils/edge-colors');

console.log('🧪 Testing Edge Runtime Color Handling\n');

// Create Edge Color Manager
const edgeColorManager = new EdgeColorManager({
  enableColors: true,
  customColors: {
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
  },
});

// Test basic colors
console.log('📊 Basic Colors:');
console.log(edgeColorManager.colorize('Red text', 'red'));
console.log(edgeColorManager.colorize('Green text', 'green'));
console.log(edgeColorManager.colorize('Blue text', 'blue'));
console.log(edgeColorManager.colorize('Yellow text', 'yellow'));
console.log('');

// Test log level colors
console.log('📝 Log Level Colors:');
console.log(edgeColorManager.colorize('Debug message', 'debug'));
console.log(edgeColorManager.colorize('Info message', 'info'));
console.log(edgeColorManager.colorize('Warning message', 'warn'));
console.log(edgeColorManager.colorize('Error message', 'error'));
console.log('');

// Test custom colors
console.log('🎨 Custom Colors:');
console.log(edgeColorManager.colorize('Success message', 'success'));
console.log(edgeColorManager.colorize('Warning message', 'warning'));
console.log(edgeColorManager.colorize('Danger message', 'danger'));
console.log('');

// Test hex colors
console.log('🔷 Hex Colors:');
console.log(edgeColorManager.colorize('Purple text', '#6f42c1'));
console.log(edgeColorManager.colorize('Cyan text', '#17a2b8'));
console.log(edgeColorManager.colorize('Gray text', '#6c757d'));
console.log('');

// Test color information
console.log('💡  Color Information:');
const colorInfo = edgeColorManager.getColorInfo();
console.log('Is Edge Runtime:', colorInfo.isEdgeRuntime);
console.log('Supports Colors:', colorInfo.supportsColors);
console.log('Enable Colors:', colorInfo.enableColors);
console.log('Force Plain Text:', colorInfo.forcePlainText);
console.log('');

// Test CSS color generation
console.log('🎨 CSS Colors:');
console.log('Red CSS:', edgeColorManager.getCSSColor('red'));
console.log('Green CSS:', edgeColorManager.getCSSColor('green'));
console.log('Blue CSS:', edgeColorManager.getCSSColor('blue'));
console.log('Custom Success CSS:', edgeColorManager.getCSSColor('success'));
console.log('');

// Test without colors
console.log('🚫 Without Colors:');
const noColorManager = new EdgeColorManager({
  enableColors: false,
});
console.log(noColorManager.colorize('This should be plain', 'red'));
console.log('');

// Test force plain text
console.log('📄 Force Plain Text:');
const plainTextManager = new EdgeColorManager({
  enableColors: true,
  forcePlainText: true,
});
console.log(plainTextManager.colorize('This should be plain', 'red'));
console.log('');

console.log('✅ Edge Runtime Color Handling Test Complete!');
