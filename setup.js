#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up JOVAC Blog Project...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`📦 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed!`, 'green');
  } catch (error) {
    log(`❌ Error during ${description}: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
} catch (error) {
  log('❌ Node.js is not installed. Please install Node.js first.', 'red');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  log('📝 Creating .env file...', 'blue');
  const envContent = `NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
`;
  fs.writeFileSync(envPath, envContent);
  log('✅ .env file created!', 'green');
} else {
  log('✅ .env file already exists', 'green');
}

// Create server directories
const serverDirs = ['server/data', 'server/uploads'];
serverDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✅ Created directory: ${dir}`, 'green');
  }
});

// Install server dependencies
runCommand('npm install', 'Installing server dependencies');

// Install client dependencies
runCommand('cd client && npm install', 'Installing client dependencies');

log('\n🎉 Setup completed successfully!', 'green');
log('\n📋 Next steps:', 'yellow');
log('1. Start the development server: npm run dev', 'blue');
log('2. Open http://localhost:3000 in your browser', 'blue');
log('3. The backend API will be available at http://localhost:5000', 'blue');
log('\n📚 Available scripts:', 'yellow');
log('- npm run dev: Start both frontend and backend', 'blue');
log('- npm run server: Start only the backend server', 'blue');
log('- npm run client: Start only the frontend', 'blue');
log('- npm run build: Build the frontend for production', 'blue');
log('\n🔧 Configuration:', 'yellow');
log('- Edit .env file to change environment variables', 'blue');
log('- Update JWT_SECRET for production deployment', 'blue');
log('\nHappy coding! 🚀', 'green'); 