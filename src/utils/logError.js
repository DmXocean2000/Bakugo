const fs = require('fs');
const path = require('path');

module.exports = function logError({ command, error, context }) {
  const timestamp = new Date().toISOString();
  const errorLog = `=== [${timestamp}] ===
Command: ${command}
User: ${context.userTag}
Message: ${context.messageContent}
Error: ${error.stack || error.message || error}

${Math.random() < 0.3 ? "You forgot to save again! THIS ISNT JETBRAINS!" : ""}
------------------\n`;

  const logPath = path.join(__dirname, '../../logs/error.log');
  fs.appendFileSync(logPath, errorLog, 'utf-8');
};
