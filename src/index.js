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

registryApp.get('/agreements/:id', (req, res) => {
  const fillAgreement = req.query.full === 'true';
  const agreementId = req.params.id;
  const agreement = fillAgreement ? agreementService.getFullAgreementById(agreementId) : agreementService.getAgreementById(agreementId);
  if (agreement) {
    res.json(agreement);
  } else {
    res.status(404).send('Agreement not found');
  }
});

registryApp.post('/agreements', express.json(), (req, res) => {
  const newAgreementInfo = req.body;
  const createdAgreement = agreementService.createAgreement(newAgreementInfo);
  if (createdAgreement) {
    res.status(201).json(createdAgreement);
  } else {
    res.status(500).send('Error creating agreement');
  }
});

registryApp.post('/agreementTemplate', express.json(), (req, res) => {
  const newTemplate = req.body;
  const createdTemplate = agreementService.createAgreementTemplate(newTemplate);
  if (createdTemplate) {
    res.status(201).json(createdTemplate);
  } else {
    res.status(500).send('Error creating agreement template');
  }
});

registryApp.get('/agreementTemplates/:id', (req, res) => {
  const templateId = req.params.id;
  const template = agreementService.getAgreementTemplateById(templateId);
  if (template) {
    res.json(template);
  } else {
    res.status(404).send('Agreement template not found');
  }
});

import scopeService from './registry/scopeService.js';

registryApp.get('/elements/:id', (req, res) => {
  const elementId = req.params.id;
  const elements = scopeService.getScopeElementById(elementId);
  if (elements) {
    res.json(elements);
  } else {
    res.status(404).send('Element not found');
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