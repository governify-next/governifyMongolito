import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const elementsFilePath = path.resolve(__dirname, 'elements.json');
let elements = [];
try {
    const data = fs.readFileSync(elementsFilePath, 'utf8');
    elements = JSON.parse(data);
} catch (error) {
    console.error('Error reading elements file:', error);
}

const getElementsCopyFromDB = () => {
    return JSON.parse(JSON.stringify(elements));
}

const organizationsFilePath = path.resolve(__dirname, 'organizations.json');
let organizations = [];
try {
    const data = fs.readFileSync(organizationsFilePath, 'utf8');
    organizations = JSON.parse(data);
} catch (error) {
    console.error('Error reading organizations file:', error);
}

// ELEMENTS ----------------------------------------------------
function getElementByOrganizationIdAndElementId(orgId, elementId) {
    return elements.find(element => element.organizationId === orgId && element.id === elementId);
}

function createElementInOrganization(orgId, newElement) {
    const organization = getOrganizationById(orgId);
    if (!organization) {
        console.error('Organization not found:', orgId);
        return "Organization not found";
    }
    if (getElementByOrganizationIdAndElementId(orgId, newElement.id)) {
        console.error('Element already exists in organization:', newElement.id);
        return "Element already exists";
    }
    const elementWithOrgId = { ...newElement, organizationId: orgId };
    elements.push(elementWithOrgId);
    return elementWithOrgId;
}

function getElementsBasedOnOrgUserAndFilters(orgId,userId,filters) {
    let userRole = getUserRoleInOrganization(orgId, userId);
    let elements = getElementsBasedOnRoleWithFilters(orgId, userRole, filters);
    return elements;
}

function getUserRoleInOrganization(orgId, userId) {
    let organization = getOrganizationById(orgId);
    // This two lines will be done in a mongo query in the future
    let roleId = organization.usersByRole.find(userByRole => userByRole.userId === userId).roleId;
    let role = organization.roles.find(r => r.id === roleId);
    return role;
}

function getElementsBasedOnRoleWithFilters(orgId, role, filters) {
    const orgElements = getElementsCopyFromDB().filter(element => element.organizationId === orgId );
    const filteredElements = orgElements.filter(element => {
        // filters are array of {fieldId: 'fieldName', value: 'valueToMatch'}
        return Object.keys(filters).every(filterKey => element.fields[filterKey] === filters[filterKey]);
    });
    const userElements = filteredElements.filter(element => {
        // element.permissions has keys with view, edit, delete and an array of roles that have that permission
        const hasAnyPermission = Object.keys(element.permissions).some(permissionType => {
            return element.permissions[permissionType].includes(role.id);
        });
        return hasAnyPermission;
    })
    // put true or false in permissions
    return userElements.map(element => {
        let elementWithPermissions = { ...element };
        Object.keys(element.permissions).forEach(permissionType => {
            elementWithPermissions.permissions[permissionType] = element.permissions[permissionType].includes(role.id);
        });
        return elementWithPermissions;
    });

};

// ORGANIZATIONS ----------------------------------------------------
function getOrganizationById(id) {
    return organizations.find(organization => organization.id === id);
}

function createOrganization(newOrg) {
    const newOrganization = {
        id: newOrg.id,
        fields: newOrg.fields,
        roles: newOrg.roles,
        usersByRole: newOrg.usersByRole
    };
    organizations.push(newOrganization);
    return newOrganization;
}

function addMemberToOrganizationWithRole(orgId, userId, roleId) {
    let organization = getOrganizationById(orgId);
    if(!organization) {
        console.error('Organization not found:', orgId);
        return "Organization not found";
    }
    if(organization.usersByRole.find(userByRole => userByRole.userId === userId)) {
        console.error('User already exists in organization:', orgId);
        return "User already exists in organization";
    }
    if(!organization.roles.find(role => role.id === roleId)) {
        console.error('Role does not exist in organization:', roleId);
        return "Role does not exist in organization";
    }
    const newUserWithRole = {
        userId: userId,
        roleId: roleId
    };
    organization.usersByRole.push(newUserWithRole);
    return organization;
}

function addRoleToOrganization(orgId, newRole) {
    let organization = getOrganizationById(orgId);
    if(!organization) {
        console.error('Organization not found:', orgId);
        return "Organization not found";
    }
    if(organization.roles.find(role => role.id === newRole.id)) {
        console.error('Role already exists in organization:', newRole.id);
        return "Role already exists in organization";
    }
    organization.roles.push(newRole);
    return organization;
}

function addFieldToOrganization(orgId, newField) {
    let organization = getOrganizationById(orgId);
    if(!organization) {
        console.error('Organization not found:', orgId);
        return "Organization not found";
    }
    if(organization.fields.find(field => field.id === newField.id)) {
        console.error('Field already exists in organization:', newField.id);
        return "Field already exists in organization";
    }
    organization.fields.push(newField);
    return organization;
}   

export default {
    getElementByOrganizationIdAndElementId,
    getElementsBasedOnOrgUserAndFilters,
    getOrganizationById,
    createOrganization,
    addMemberToOrganizationWithRole,
    addRoleToOrganization, 
    addFieldToOrganization,
    createElementInOrganization
};