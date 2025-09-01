const [currentMajor] = process.versions.node.split('.').map(Number);

if (currentMajor < 21) {
  console.error(`
  🚫 Unsupported Node.js version detected!
  
     • Required : Node.js v21 or newer
     • Current  : v${process.versions.node}
     
  👉 Please install Node.js 21+ to continue.
  `);
  process.exit(1);
}