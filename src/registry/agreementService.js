import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import scopeService from './scopeService.js';

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

const getNewGuarantee = (guaranteeTemplateInfo, elementId, partId) => {
    let newGuarantee = JSON.parse(JSON.stringify(guaranteeTemplateInfo));
    // WINDOW CONFIGURATION
    newGuarantee.window = {};
    newGuarantee.window.period = guaranteeTemplateInfo.window.period;
    newGuarantee.window.index = guaranteeTemplateInfo.window.index ?? 0;

    // SPECIFIC CONFIGURATION FOR ELEMENT / PART
    newGuarantee.config = {};
    newGuarantee.config.elementId = elementId;
    if (partId) {
        newGuarantee.config.elementPartId = partId;
    }
    return newGuarantee;
}

function createAgreement(orgId, elementId, newAgreementInfo) {
    const element = scopeService.getElementByOrganizationIdAndElementId(orgId, elementId);
    const agreementTemplate = agreementTemplates.find(template => template.id === newAgreementInfo.agreementTemplate.id);
    const guaranteeTemplatesFromAgreementTemplate = agreementTemplate.guaranteeTemplates;
    
    let guaranteeInstances = [];
    const modificationsMap = new Map(
        newAgreementInfo.agreementTemplate.guaranteeModifications.map(m => [m.guaranteeTemplateId, m])
    );

    for (const guaranteeTemplateInfo of guaranteeTemplatesFromAgreementTemplate) {
    const guaranteeTemplate = guaranteeTemplates.find(gt => gt.id === guaranteeTemplateInfo.id);
    
    if (!guaranteeTemplate.multiPart) {
        // CASE: is single part (no need to subdivide in multiple guarantees)
        guaranteeInstances.push(getNewGuarantee(guaranteeTemplateInfo, element.id));
    } else {
        // CASE: is multipart (generate one guarantee instance per part or per selected parts)
        const modification = modificationsMap.get(guaranteeTemplateInfo.id);

        let selectedParts = element.parts;
        // If there are selected parts in the agreement creation for a guarantee, filter the parts accordingly
        if (modification) selectedParts = element.parts.filter(p => modification.parts.includes(p.id))

        for (const part of selectedParts) {
        guaranteeInstances.push(getNewGuarantee(guaranteeTemplateInfo, element.id, part.id));
        }
    }
    }

    if (!agreementTemplate) {
        console.error('Agreement template not found:', newAgreementInfo.agreementTemplate.id);
        return "Agreement template not found";
    }

    if (!agreementTemplate) {
        console.error('Agreement template not found:', newAgreementInfo.agreementTemplate.id);
        return "Agreement template not found";
    }
    if(agreements.find(a => a.id === newAgreementInfo.id)) {
        console.error('Agreement with this ID already exists:', newAgreementInfo.id);
        return "Agreement with this ID already exists";
    }
    const agreement = {
        id: newAgreementInfo.id,
        organizationId: orgId,
        elementId: elementId,
        auditableVersion: 1,
        versions: [
            {
                id: 1,
                validity: {
                    earlyTermination: null,
                    timeZone: newAgreementInfo.initialVersion.validity.timeZone
                },
                contract: {
                    agreementTemplateId: agreementTemplate.id,
                    guarantees: guaranteeInstances,
                    validity: {
                        start: newAgreementInfo.initialVersion.validity.start,
                        end: newAgreementInfo.initialVersion.validity.end,
                        timeZone: newAgreementInfo.initialVersion.validity.timeZone
                    }
                }
            }
        ],
        fields: newAgreementInfo.fields,
        permissions: newAgreementInfo.permissions
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

function getAgreementTemplateById(id) {
    let template = agreementTemplates.find(template => template.id === id);
    return template;
}

function getAgreementsByOrgIdAndElementId(filters, orgId = null, elementId = null) {
    let agreementsResult = [];
    if (elementId) {
        agreementsResult = agreements.filter(agreement => agreement.organizationId === orgId && agreement.elementId === elementId);
    } else {
        agreementsResult = agreements.filter(agreement => agreement.organizationId === orgId);
    }
    agreementsResult = agreementsResult.filter(agreement => {
        return Object.keys(filters).every(filterKey => agreement.fields[filterKey] === filters[filterKey]);
    });
    return agreementsResult;
}

function getAgreementById(id, orgId = null, elementId = null) {
    let agreement = null;
    if (elementId) {
        agreement = agreements.find(agreement => agreement.organizationId === orgId && agreement.elementId === elementId && agreement.id === id);
    } else {
        agreement = agreements.find(agreement => agreement.id === id && agreement.organizationId && agreement.elementId);
    }
    if (!agreement) return "Agreement not found";
    return agreement;
}

function getFullAgreementById(id, orgId = null, elementId = null) {
    let agreement = null;
    if (elementId) {
        agreement = agreements.find(agreement => agreement.organizationId === orgId && agreement.elementId === elementId && agreement.id === id);
    } else {
        agreement = agreements.find(agreement => agreement.id === id && agreement.organizationId && agreement.elementId);
    }
    if (!agreement) return "Agreement not found";
    let agreementCopy = JSON.parse(JSON.stringify(agreement));
    for (const version of agreementCopy.versions) {
        for (const guarantee of version.contract.guarantees) {
            let guaranteeTemplate = guaranteeTemplates.find(template => template.id === guarantee.id);
            if (guaranteeTemplate) {
                guarantee.numericExpression = guaranteeTemplate.numericExpression;
                guarantee.metrics = guaranteeTemplate.metrics;
                guarantee.info = guaranteeTemplate.info;
                guarantee.multiPart = guaranteeTemplate.multiPart;
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
    getAgreementTemplateById,
    getAgreementsByOrgIdAndElementId
};