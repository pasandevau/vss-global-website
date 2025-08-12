const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);
const excludeDirs = ['node_modules', 'dist'];

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        // Skip excluded directories
        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                processDirectory(fullPath);
            }
            return;
        }
        
        // Only process HTML files
        if (path.extname(file) === '.html' && !file.includes('node_modules') && !file.includes('dist')) {
            try {
                let content = fs.readFileSync(fullPath, 'utf8');
                const updatedContent = content.replace(
                    /<a href=\"index\.html\" class=\"nav-link(?:\s+active)?\">Home<\/a>\s*/g,
                    ''
                );
                
                if (content !== updatedContent) {
                    fs.writeFileSync(fullPath, updatedContent, 'utf8');
                    console.log(`Updated: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error processing ${fullPath}:`, err);
            }
        }
    });
}

// Start processing from the current directory
processDirectory(directoryPath);
console.log('Home link removal completed!');
