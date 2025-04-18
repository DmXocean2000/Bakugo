const fs = require('fs');
const path = require('path');

function getAllCommandFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllCommandFiles(fullPath, files);
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

module.exports = (client) => {
  client.commands = new Map();

  const commandFiles = getAllCommandFiles(path.join(__dirname, '../commands'));
  for (const file of commandFiles) {
    const command = require(file);
    if (command.name) {
      //console.log(`[COMMAND LOADED] ${command.name} from ${file}`);
      client.commands.set(command.name, command);
    }
  }
};
