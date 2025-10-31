import express from 'express';

export const microservices = {
  registry: {
    url: 'http://localhost:4001',
    port: 4001,
  },
  scope: {
    url: 'http://localhost:4002',
    port: 4002,
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
  const newAgreement = req.body;
  const createdAgreement = agreementService.createAgreement(newAgreement);
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

registryApp.listen(microservices.registry.port, () => {
  console.log(`Registry Service is running at: http://localhost:${microservices.registry.port}`);
});

// ============================== Scope Service ==============================

const scopeApp = express();

scopeApp.get('/', (req, res) => {
  res.send('Scope Service is running!');
});

scopeApp.listen(microservices.scope.port, () => {
  console.log(`Scope Service is running at http://localhost:${microservices.scope.port}`);
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
const reporterApp = express();

reporterApp.get('/', (req, res) => {
  res.send('Reporter Application is running!');
});
reporterApp.listen(microservices.reporter.port, () => {
  console.log(`Reporter Application is running at http://localhost:${microservices.reporter.port}`);
});