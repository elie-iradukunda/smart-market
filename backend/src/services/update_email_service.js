const fs = require('fs');
const path = require('path');

const emailServicePath = 'c:\\Users\\user\\Desktop\\LanariMarket\\smart-market\\backend\\src\\services\\emailService.js';
const newFunctionPath = 'c:\\Users\\user\\Desktop\\LanariMarket\\smart-market\\backend\\src\\services\\new_function.js';

try {
    const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');
    const newFunctionContent = fs.readFileSync(newFunctionPath, 'utf8');

    const lines = emailServiceContent.split('\n');
    
    // Remove lines 639-713 (0-indexed: 638-712)
    // We verify the content starts with "  // Supplier Welcome Email" at index 638
    if (!lines[638].includes('// Supplier Welcome Email')) {
        console.error('Error: Line 639 does not match expected content.');
        console.error('Found:', lines[638]);
        process.exit(1);
    }

    // Remove 75 lines starting from index 638
    lines.splice(638, 75, newFunctionContent);

    fs.writeFileSync(emailServicePath, lines.join('\n'));
    console.log('File updated successfully');
} catch (error) {
    console.error('Error updating file:', error);
    process.exit(1);
}
