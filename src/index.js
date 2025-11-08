import express from 'express';

export const microservices = {
  registry: {
    url: 'http://localhost:4001',
    port: 4001,
  },
  collector: {
    url: 'http://localhost:4003',
    port: 4003,
  },
  reporter: {
    url: 'http://localhost:4004',
    port: 4004,
  },
  user: {
    url: 'http://localhost:4002',
    port: 4002
  }
};

import usecase from './usecase.js';

const baseApp = express();

baseApp.get('/', async (req, res) => {
  const config = req.query;
  await usecase.execute(config);
  res.send('Base Application is running!');
});

baseApp.listen(4099, () => {
  console.log('Base Application is running at http://localhost:4099');
}
);

// ============================== Registry Service ==============================

import agreementService from './registry/agreementService.js';

const registryApp = express();

registryApp.get('/', (req, res) => {
  res.send('Registry Service is running!');
});  

registryApp.get('/organizations/:orgId/elements/:elementId/agreements', (req, res) => {
  const filters = req.query;
  const orgId = req.params.orgId;
  const elementId = req.params.elementId;
  const agreements = agreementService.getAgreementsByOrgIdAndElementId(filters, orgId, elementId);
  if (agreements) {
    res.json(agreements);
  } else {
    res.status(404).send('Agreement not found');
  }
});

registryApp.get('/organizations/:orgId/elements/:elementId/agreements/:agreementId', (req, res) => {
  const fillAgreement = req.query.full === 'true';
  const orgId = req.params.orgId;
  const elementId = req.params.elementId;
  const agreementId = req.params.agreementId;
  const agreement = fillAgreement ? agreementService.getFullAgreementById(agreementId, orgId, elementId) : agreementService.getAgreementById(agreementId, orgId, elementId);
  if (agreement) {
    res.json(agreement);
  } else {
    res.status(404).send('Agreement not found');
  }
});

registryApp.get('/organizations/:orgId/agreements', (req, res) => {
  const filters = req.query;
  const orgId = req.params.orgId;
  const agreements = agreementService.getAgreementsByOrgIdAndElementId(filters, orgId);
  if (agreements) {
    res.json(agreements);
  } else {
    res.status(404).send('Agreement not found');
  }
});

registryApp.get('/organizations/:orgId/agreements/:AgId', (req, res) => {
  const fillAgreement = req.query.full === 'true';
  const orgId = req.params.orgId;
  const agreementId = req.params.AgId;
  const agreement = fillAgreement ? agreementService.getFullAgreementById(agreementId, orgId) : agreementService.getAgreementById(agreementId, orgId);
  if (agreement) {
    res.json(agreement);
  } else {
    res.status(404).send('Agreement not found');
  }
});

registryApp.post('/organizations/:orgId/elements/:elementId/agreements', express.json(), (req, res) => {
  const orgId = req.params.orgId;
  const elementId = req.params.elementId;
  const newAgreementInfo = req.body;
  const createdAgreement = agreementService.createAgreement(orgId, elementId, newAgreementInfo); //HAY QUE VALIDAR LOS FIELDS Y PERMISSIONS. USANDO LA MISMA FUNCION QUE EN EL PUT
  if (createdAgreement) {
    res.status(201).json(createdAgreement);
  } else {
    res.status(500).send('Error creating agreement');
  }
});

registryApp.post('/agreementTemplates', express.json(), (req, res) => {
  const newTemplate = req.body;
  const createdTemplate = agreementService.createAgreementTemplate(newTemplate);
  if (createdTemplate) {
    res.status(201).json(createdTemplate);
  } else {
    res.status(500).send('Error creating agreement template');
  }
});

registryApp.get('/agreementTemplates/:AgTemplateId', (req, res) => {
  const templateId = req.params.AgTemplateId;
  const template = agreementService.getAgreementTemplateById(templateId);
  if (template) {
    res.json(template);
  } else {
    res.status(404).send('Agreement template not found');
  }
});

registryApp.get
 
import scopeService from './registry/scopeService.js';

registryApp.get('/organizations/:orgId/user/:userId/elements', (req, res) => {
  const orgId = req.params.orgId;
  const userId = req.params.userId;
  const filters = req.query;
  const elements = scopeService.getElementsBasedOnOrgUserAndFilters(orgId,userId,filters);
  res.json(elements);
}
);

registryApp.get('/organizations/:orgId/elements/:elementId', (req, res) => {
  const orgId = req.params.orgId;
  const elementId = req.params.elementId;
  const element = scopeService.getElementByOrganizationIdAndElementId(orgId, elementId);
  if (element) {
    res.json(element);
  } else {
    res.status(404).send('Element not found');
  }
});

registryApp.post('/organizations/:orgId/elements', express.json(), (req, res) => { 
  const orgId = req.params.orgId;
  const newElement = req.body;
  const createdElement = scopeService.createElementInOrganization(orgId, newElement); //HAY QUE VALIDAR LOS FIELDS Y PERMISSIONS. USANDO LA MISMA FUNCION QUE EN EL PUT
  if (createdElement) {
    res.status(201).json(createdElement);
  } else {
    res.status(500).send('Error creating element');
  }
});

registryApp.post('/organizations', express.json(), (req, res) => {
  const newOrg = req.body;
  const createdOrg = scopeService.createOrganization(newOrg);
  if (createdOrg) {
    res.status(201).json(createdOrg);
  } else {
    res.status(500).send('Error creating organization');
  }
});

registryApp.get('/organizations/:orgId', (req, res) => {
  const orgId = req.params.orgId;
  const organization = scopeService.getOrganizationById(orgId);
  if (organization) {
    res.json(organization);
  } else {
    res.status(404).send('Organization not found');
  }
});

registryApp.post('/organizations/:orgId/members', express.json(), (req, res) => {
  const orgId = req.params.orgId;
  const newMemberWithRole = req.body;
  const updatedOrg = scopeService.addMemberToOrganizationWithRole(orgId, newMemberWithRole.userId, newMemberWithRole.roleId);
  if (updatedOrg) {
    res.json(updatedOrg);
  } else {
    res.status(404).send('Organization not found');
  }
});

registryApp.post('/organizations/:orgId/roles', express.json(), (req, res) => {
  const orgId = req.params.orgId;
  const newRole = req.body;
  const updatedOrg = scopeService.addRoleToOrganization(orgId, newRole);
  if (updatedOrg) {
    res.json(updatedOrg);
  } else {
    res.status(404).send('Organization not found');
  }
});

registryApp.post('/organizations/:orgId/fields', express.json(), (req, res) => {
  const orgId = req.params.orgId;
  const newField = req.body;
  const updatedOrg = scopeService.addFieldToOrganization(orgId, newField);
  if (updatedOrg) {
    res.json(updatedOrg);
  } else {
    res.status(404).send('Organization not found');
  }
});

registryApp.listen(microservices.registry.port, () => {
  console.log(`Registry Service is running at: http://localhost:${microservices.registry.port}`);
});

// ============================== Collector Application ==============================

const collectorApp = express();

collectorApp.get('/', (req, res) => {
  res.send('Collector Application is running!');
});

collectorApp.listen(microservices.collector.port, () => {
  console.log(`Collector Application is running at http://localhost:${microservices.collector.port}`);
});

// ============================== Reporter Application ==============================

import reporterService from './reporter/reporterService.js';

const reporterApp = express();

reporterApp.get('/', (req, res) => {
  res.send('Reporter Application is running!');
});

reporterApp.post('/reports/generate',  express.json(), (req, res) => {
  const { agreement, periods, selectedGuarantees, element } = req.body;
  const result = reporterService.generateReport(agreement, periods, selectedGuarantees, element);
  res.send(result);
});

reporterApp.listen(microservices.reporter.port, () => {
  console.log(`Reporter Application is running at http://localhost:${microservices.reporter.port}`);
});

// ============================== User Service ==============================

import userService from './user/userService.js';

const userApp = express();

userApp.get('/', (req, res) => {
  res.send('User Service is running!');
});

userApp.get('/users', (req, res) => {
  // no filters: always return all users
  const users = userService.getAllUsers();
  res.json(users);
});

userApp.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const user = userService.getUserById(userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send('User not found');
  }
});

userApp.post('/users', express.json(), (req, res) => {
  const newUser = req.body;
  const created = userService.createUser(newUser);
  if (created && created.error) {
    res.status(400).json(created);
  } else {
    res.status(201).json(created);
  }
});

userApp.listen(microservices.user.port, () => {
  console.log(`User Service is running at: http://localhost:${microservices.user.port}`);
});