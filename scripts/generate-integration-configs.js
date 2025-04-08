/**
 * Integration Configuration Generator
 * 
 * This script generates configuration files for all supported integrations:
 * - Smithery.ai (for Claude)
 * - VSCode
 * - Cursor
 * - CLI
 * - Windsurf
 */

require('dotenv').config();
const { writeIntegrationFiles } = require('../src/utils/integrations');
const { logger } = require('../src/utils/logger');

// Process command line args
const args = process.argv.slice(2);
const outputDir = args[0] || 'config';

logger.info(`Generating integration configuration files in ${outputDir}`);

// Generate integration files
writeIntegrationFiles(outputDir);

logger.info('Done! Generated configuration files for all supported integrations.');
logger.info(`Check the '${outputDir}' directory for the generated files.`);

logger.info('\nSupported integrations:');
logger.info('- Claude (via Smithery.ai) - smithery-example.yaml');
logger.info('- VSCode - vscode-settings-example.json');
logger.info('- Cursor - cursor-settings-example.json');
logger.info('- CLI - cli-config-example.json');
logger.info('- Windsurf - windsurf-config-example.json');

logger.info('\nTo use these files:');
logger.info('1. Copy them to the appropriate locations');
logger.info('2. Rename them as needed');
logger.info('3. Update any placeholders with your specific values');