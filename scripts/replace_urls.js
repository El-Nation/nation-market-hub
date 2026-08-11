const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../client/src'));
let changes = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern 1: API_BASE toggle
    content = content.replace(/const API_BASE\s*=\s*window\.location\.hostname\s*===\s*'localhost'\s*\?\s*'http:\/\/localhost:5000'\s*:\s*'';/g, "const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';");

    // Pattern 2: fetch('http://localhost:5000...') -> fetch(`${import.meta.env.VITE_API_URL}...`)
    content = content.replace(/fetch\('http:\/\/localhost:5000([^']+)'/g, 'fetch(`${import.meta.env.VITE_API_URL}$1`');

    // Pattern 3: fetch(`http://localhost:5000...`) -> fetch(`${import.meta.env.VITE_API_URL}...`)
    content = content.replace(/fetch\(`http:\/\/localhost:5000([^`]+)`/g, 'fetch(`${import.meta.env.VITE_API_URL}$1`');

    // Pattern 4: Error strings (replace literally)
    content = content.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL}");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changes++;
        console.log('Updated:', path.basename(file));
    }
});

console.log('Modified files count:', changes);
