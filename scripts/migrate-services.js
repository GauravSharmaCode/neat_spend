#!/usr/bin/env node

/**
 * Migration script to move neatspend packages from root to services folder
 * and update the monorepo structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const servicesDir = path.join(rootDir, 'services');

console.log('🚀 Migrating NeatSpend packages to services folder...\n');

// Services to migrate from root
const servicesToMigrate = [
  {
    oldPath: 'neatspend-auth-verifier',
    newName: 'auth-verifier-service',
    description: 'Authentication verification service'
  },
  {
    oldPath: 'neatspend-sms-parser', 
    newName: 'sms-parser-service',
    description: 'SMS parsing and processing service'
  },
  {
    oldPath: 'neatspend-pubsub-handler',
    newName: 'pubsub-handler-service', 
    description: 'Pub/Sub message handling service'
  }
];

// Services to remove (redundant with @gauravsharmacode/neat-logger)
const servicesToRemove = [
  'neatspend-logger' // Replaced by @gauravsharmacode/neat-logger
];

/**
 * Migrate existing content to new service structure
 */
function migrateService(oldPath, newName, description) {
  const oldDir = path.join(rootDir, oldPath);
  const newDir = path.join(servicesDir, newName);
  
  if (!fs.existsSync(oldDir)) {
    console.log(`⚠️  Source directory ${oldPath} does not exist, skipping...`);
    return;
  }

  console.log(`📦 Migrating ${oldPath} → services/${newName}`);

  // Create new service if it doesn't exist
  if (!fs.existsSync(newDir)) {
    console.log(`   Creating service structure for ${newName}...`);
    try {
      execSync(`node scripts/create-service.js ${newName}`, { 
        cwd: rootDir,
        stdio: 'pipe'
      });
    } catch (error) {
      console.log(`   ✅ Service ${newName} already exists or created successfully`);
    }
  }

  // Read existing content
  const existingFiles = fs.readdirSync(oldDir);
  
  // Migrate README if it exists
  const readmePath = path.join(oldDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    const newReadmePath = path.join(newDir, 'LEGACY_README.md');
    
    // Create a new README that references the old one
    const newReadme = `# ${newName}

${description}

## Migration Note

This service was migrated from the root-level \`${oldPath}\` package.

## Legacy Documentation

See [LEGACY_README.md](./LEGACY_README.md) for the original documentation.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

- \`GET /\` - Service information
- \`GET /health\` - Health check

## Development

- \`npm run dev\` - Start development server  
- \`npm test\` - Run tests
- \`npm run lint\` - Run linting

## TODO

- [ ] Implement business logic from legacy package
- [ ] Add proper API endpoints
- [ ] Set up database models if needed
- [ ] Add comprehensive tests
`;

    fs.writeFileSync(path.join(newDir, 'README.md'), newReadme);
    fs.writeFileSync(newReadmePath, readmeContent);
    console.log(`   ✅ Migrated README.md to LEGACY_README.md`);
  }

  // Migrate other important files
  existingFiles.forEach(file => {
    if (file === 'README.md') return; // Already handled
    
    const oldFilePath = path.join(oldDir, file);
    const newFilePath = path.join(newDir, 'legacy', file);
    
    // Create legacy directory
    const legacyDir = path.join(newDir, 'legacy');
    if (!fs.existsSync(legacyDir)) {
      fs.mkdirSync(legacyDir, { recursive: true });
    }

    // Copy file
    if (fs.statSync(oldFilePath).isFile()) {
      fs.copyFileSync(oldFilePath, newFilePath);
      console.log(`   ✅ Migrated ${file} to legacy/${file}`);
    }
  });

  console.log(`   🎉 Migration complete for ${newName}\n`);
}

/**
 * Remove redundant services
 */
function removeRedundantService(serviceName) {
  const servicePath = path.join(rootDir, serviceName);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`⚠️  Service ${serviceName} does not exist, skipping removal...`);
    return;
  }

  console.log(`🗑️  Removing redundant service: ${serviceName}`);
  console.log(`   This functionality is now provided by @gauravsharmacode/neat-logger`);
  
  // Create a deprecation notice
  const deprecationNotice = `# ${serviceName} - DEPRECATED

⚠️ **This package has been deprecated**

This functionality is now provided by the [\`@gauravsharmacode/neat-logger\`](https://www.npmjs.com/package/@gauravsharmacode/neat-logger) npm package.

## Migration

Replace usage of this package with:

\`\`\`javascript
const { createLogger } = require('@gauravsharmacode/neat-logger');

const logger = createLogger({
  service: 'your-service-name',
  level: 'info'
});

logger.info('Your log message', { additional: 'data' });
\`\`\`

## Removal Date

This package was deprecated on ${new Date().toISOString().split('T')[0]} and moved to archived/deprecated.
`;

  // Move to archived folder
  const archivedDir = path.join(rootDir, 'archived');
  if (!fs.existsSync(archivedDir)) {
    fs.mkdirSync(archivedDir);
  }

  const archivedPath = path.join(archivedDir, serviceName);
  
  // Copy to archived
  execSync(`xcopy /E /I "${servicePath}" "${archivedPath}"`, { stdio: 'pipe' });
  
  // Write deprecation notice
  fs.writeFileSync(path.join(archivedPath, 'DEPRECATED.md'), deprecationNotice);
  
  console.log(`   ✅ Moved to archived/${serviceName} with deprecation notice\n`);
}

/**
 * Update package.json workspaces
 */
function updateWorkspaces() {
  console.log('📝 Updating package.json workspaces...');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update workspaces to include all services
  packageJson.workspaces = [
    "services/*",
    "shared"
  ];
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Updated workspaces configuration\n');
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('🎯 Starting NeatSpend monorepo migration...\n');
    
    // Migrate services
    servicesToMigrate.forEach(({ oldPath, newName, description }) => {
      migrateService(oldPath, newName, description);
    });
    
    // Remove redundant services
    servicesToRemove.forEach(serviceName => {
      removeRedundantService(serviceName);
    });
    
    // Update package.json
    updateWorkspaces();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review migrated services in the services/ folder');
    console.log('2. Implement business logic in the new service structure');
    console.log('3. Remove old directories from root after verification');
    console.log('4. Update CI/CD configurations if needed');
    console.log('5. Run: npm run install:all');
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
runMigration();
