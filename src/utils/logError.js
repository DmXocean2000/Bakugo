const fs = require('fs');
const path = require('path');

module.exports = function logError({ command, error, context = {} }) {
  const logDir = path.resolve(__dirname, '../logs');
  const logFile = path.join(logDir, 'error.log');

  // Ensure the logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const timestamp = new Date().toISOString();
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  const logEntry = `\n[${timestamp}]\nCOMMAND: ${command}\nERROR: ${error.stack || error}\nCONTEXT:\n${contextString}\n`;

  fs.appendFileSync(logFile, logEntry);
};
