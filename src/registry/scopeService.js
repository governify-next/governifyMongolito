import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const scopeElementsFilePath = path.resolve(__dirname, 'scopeElements.json');
let scopeElements = [];
try {
    const data = fs.readFileSync(scopeElementsFilePath, 'utf8');
    scopeElements = JSON.parse(data);
} catch (error) {
    console.error('Error reading scope elements file:', error);
}
function getScopeElementById(id) {
    return scopeElements.find(element => element.id === id);
}

export default {
    getScopeElementById
};