const fs = require('fs');

const dataFile = fs.readFileSync('src/lib/data.ts', 'utf8');
const schemasFile = fs.readFileSync('src/lib/action-schemas.ts', 'utf8');

const appRegex = /id:\s*"([a-z0-9-]+)",\s*name:\s*"([^"]+)"[\s\S]*?actions:\s*\[([\s\S]*?)\]/g;
let match;
while ((match = appRegex.exec(dataFile)) !== null) {
  const appId = match[1];
  const appName = match[2];
  const actionsBlock = match[3];
  const actionRegex = /id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
  let actMatch;
  const actions = [];
  while ((actMatch = actionRegex.exec(actionsBlock)) !== null) {
    actions.push({ id: actMatch[1], name: actMatch[2] });
  }
  if (actions.length > 1) {
    console.log(`\nApp: ${appId} (${appName}) has ${actions.length} actions:`);
    actions.forEach(a => {
      const isHandledInResolver = schemasFile.includes(a.id);
      console.log(`  - ${a.id} ("${a.name}"): ${isHandledInResolver ? 'Found in action-schemas' : 'MISSING from action-schemas'}`);
    });
  }
}
