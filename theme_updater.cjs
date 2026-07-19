const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

const replacements = [
  { regex: /#FF385C/g, replace: '#014BAA' },
  { regex: /#E31C5F/g, replace: '#013b86' },
  { regex: /bg-rose-/g, replace: 'bg-blue-' },
  { regex: /text-rose-/g, replace: 'text-blue-' },
  { regex: /border-rose-/g, replace: 'border-blue-' },
  { regex: /shadow-rose-/g, replace: 'shadow-blue-' },
  { regex: /from-rose-/g, replace: 'from-blue-' },
  { regex: /to-rose-/g, replace: 'to-blue-' },
  { regex: /ring-rose-/g, replace: 'ring-blue-' },
  { regex: /from-pink-/g, replace: 'from-indigo-' },
  { regex: /to-pink-/g, replace: 'to-indigo-' },
  { regex: /bg-pink-/g, replace: 'bg-indigo-' },
  { regex: /text-pink-/g, replace: 'text-indigo-' },
  { regex: /bg-gray-50/g, replace: 'bg-[#F8F3F0]' }
];

let filesChanged = 0;

walkDir(srcDir, function(filePath) {
  // Only process ts, tsx, css, js, html files
  if (!/\.(tsx|ts|css|html|js)$/.test(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath.replace(__dirname, '')}`);
    filesChanged++;
  }
});

console.log(`Theme update complete! Changed ${filesChanged} files.`);
