import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const archiveFilePath = path.resolve(__dirname, 'archiveDB.json');
let archiveDB = [];
try {
    const data = fs.readFileSync(archiveFilePath, 'utf8');
    archiveDB = JSON.parse(data);
} catch (error) {
    console.error('Error reading archiveDB file:', error);
}

const getCopyFromArchiveDB = () => {
    return JSON.parse(JSON.stringify(archiveDB));
}

const getDataFromArchiveForMetricWithParams = (elementId, dataType, fields, ) => {
    const latestArchive = archiveDB[archiveDB.length - 1];
    return latestArchive ? latestArchive.rawData : [];
}

const getDataFromArchiveForMetricWithQuery = (query) => {
    // TODO
    return; 
}

export default {
    getDataFromArchiveForMetric
};
