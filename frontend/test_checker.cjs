const React = require('react');
const fs = require('fs');

console.log('Testing JSX syntax and imports...');
try {
  const fileContent = fs.readFileSync('./src/Checker.jsx', 'utf8');
  console.log('File read ok, length:', fileContent.length);
} catch (e) {
  console.error('Read error:', e);
}
