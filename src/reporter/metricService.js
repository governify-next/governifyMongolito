import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const metricsFilePath = path.resolve(__dirname, 'metrics.json');
let metrics = [];
try {
    const data = fs.readFileSync(metricsFilePath, 'utf8');
    metrics = JSON.parse(data);
} catch (error) {
    console.error('Error reading metrics file:', error);
}

const getMetricById = (id) => {
    return metrics.find(metric => metric.id === id);
}

const processMetric = (metricId, date, guaranteeWindow, elementAuditConfig, elementPartAuditConfig) => {
    const metric = getMetricById(metricId);
    if (!metric) {
        console.error(`Metric not found: ${metricId}`);
        return "Metric not found";
    }
    const data = getDataFromArchiveForMetric(elementAuditConfig, elementPartAuditConfig);

    if (metric.code) {
        return eval(metric.code);
    }

    switch (metric.id) {
        case 'GITHUB_TEAM_NUMBER_COMMITS':
            return GITHUB_TEAM_NUMBER_COMMITS();

        case 'GITHUB_MEMBER_NUMBER_COMMITS':
            return GITHUB_MEMBER_NUMBER_COMMITS(elementPartAuditConfig);
                 
        default:
            return null;
    }
}

function GITHUB_TEAM_NUMBER_COMMITS() {
    const result = [];
    for (const data of archiveDB[archiveDB.length - 1].rawData) {
        result.push(data);
    }
    return { number: result.length, evidences: result };
}

function GITHUB_MEMBER_NUMBER_COMMITS(elementPartAuditConfig) {
    const result = [];
    for (const data of archiveDB[archiveDB.length - 1].rawData) {
        console.log(elementPartAuditConfig)
        if(data.author === elementPartAuditConfig.credentials.github.username) {
            result.push(data);
        }
    }
    return { number: result.length, evidences: result };
}


export default {
    processMetric 
};