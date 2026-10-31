const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const bundlePath = path.resolve(projectRoot, '..', 'shipper-all-code.md');

if (!fs.existsSync(bundlePath)) {
  console.error(`Bundle file not found: ${bundlePath}`);
  process.exit(1);
}

const bundle = fs.readFileSync(bundlePath, 'utf8');
const lines = bundle.split(/\r?\n/);
const files = [];

let currentHeading = null;
let currentCode = [];
let inCodeBlock = false;

for (const line of lines) {
  const headingMatch = line.match(/^##\s+(.*)$/);

  if (headingMatch) {
    if (currentHeading && inCodeBlock) {
      files.push({ path: currentHeading, content: currentCode.join('\n') });
    }

    currentHeading = headingMatch[1].trim();
    currentCode = [];
    inCodeBlock = false;
    continue;
  }

  if (currentHeading) {
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      currentCode.push(line);
    }
  }
}

if (currentHeading && inCodeBlock) {
  files.push({ path: currentHeading, content: currentCode.join('\n') });
}

let created = 0;
for (const file of files) {
  const rawPath = file.path.replace(/^shipper\//, '').trim();
  if (!rawPath || rawPath === 'File tree' || rawPath.startsWith('File tree')) continue;

  const target = path.join(projectRoot, rawPath);
  const targetDir = path.dirname(target);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(target, file.content, 'utf8');
  created += 1;
}

console.log(`Extracted ${created} files from ${path.basename(bundlePath)} into ${projectRoot}`);
