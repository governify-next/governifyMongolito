import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const agreementsFilePath = path.resolve(__dirname, 'agreementInstances.json');
let agreements = [];
try {
    const data = fs.readFileSync(agreementsFilePath, 'utf8');
    agreements = JSON.parse(data);
} catch (error) {
    console.error('Error reading agreements file:', error);
}

const guaranteeTemplatesFilePath = path.resolve(__dirname, 'guaranteeTemplates.json');
let guaranteeTemplates = [];
try {
    const data = fs.readFileSync(guaranteeTemplatesFilePath, 'utf8');
    guaranteeTemplates = JSON.parse(data);
} catch (error) {
    console.error('Error reading guarantee templates file:', error);
}

const agreementTemplatesFilePath = path.resolve(__dirname, 'agreementTemplates.json');
let agreementTemplates = [];
try {
    const data = fs.readFileSync(agreementTemplatesFilePath, 'utf8');
    agreementTemplates = JSON.parse(data);
} catch (error) {
    console.error('Error reading agreement templates file:', error);
}

function createAgreement(newAgreement) {
    const agreementTemplate = agreementTemplates.find(template => template.id === newAgreement.agreementTemplateId);
    if (!agreementTemplate) {
        console.error('Agreement template not found:', newAgreement.agreementTemplateId);
        return "Agreement template not found";
    }
    if(agreements.find(a => a.id === newAgreement.id)) {
        console.error('Agreement with this ID already exists:', newAgreement.id);
        return "Agreement with this ID already exists";
    }
    const agreement = {
        id: newAgreement.id,
        auditableVersion: 1,
        versions: [
            {
                validity: {
                    earlyTermination: null,
                    timeZone: newAgreement.initialVersion.validity.timeZone
                },
                contract: {
                    version: 1,
                    agreementTemplateId: agreementTemplate.id,
                    guarantees: agreementTemplate.guaranteeTemplates,
                    validity: {
                        start: newAgreement.initialVersion.validity.start,
                        end: newAgreement.initialVersion.validity.end,
                        timeZone: newAgreement.initialVersion.validity.timeZone
                    }
                },
                moreInfo: newAgreement.initialVersion.moreInfo
            }
        ]        
    };
    agreements.push(agreement);
    return agreement;
}

function createAgreementTemplate(newTemplate) {
    if (agreementTemplates.find(t => t.id === newTemplate.id)) {
        console.error('Agreement template with this ID already exists:', newTemplate.id);
        return "Agreement template with this ID already exists";
    }
    const template = {
        id: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
        guaranteeTemplates: newTemplate.guaranteeTemplates
    };
    agreementTemplates.push(template);
    return template;
}

function getAgreementById(id) {
    let agreement = agreements.find(agreement => agreement.id === id);
    return agreement;
}

function getFullAgreementById(id) {
    let agreement = agreements.find(agreement => agreement.id === id);
    if (!agreement) return null;
    let agreementCopy = JSON.parse(JSON.stringify(agreement));
    for (const version of agreementCopy.versions) {
        for (const guarantee of version.contract.guarantees) {
            let guaranteeTemplate = guaranteeTemplates.find(template => template.id === guarantee.id);
            if (guaranteeTemplate) {
                guarantee.operation = guaranteeTemplate.operation;
                guarantee.metrics = guaranteeTemplate.metrics;
                guarantee.info = guaranteeTemplate.info;
            }
        }
    }
    return agreementCopy;
}

export default {
    createAgreement,
    createAgreementTemplate,
    getAgreementById,
    getFullAgreementById,
};