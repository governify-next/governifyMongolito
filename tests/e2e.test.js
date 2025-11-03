import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { microservices } from '../src/index.js';

let server;

beforeAll(() => {
  // Initialize servers if necessary
  server = {}; // Simulated initialization
});

afterAll(() => {
  // Close servers if necessary
  server = null;
});

describe('End-to-End Test for Usecase', () => {
  it('should execute the usecase flow successfully', async () => {
    const agreementId = 'test-agreement';
    const versionId = 1;

    try {
      // Step 1: Get Element from Registry Service
      const elementId = 'repository1';
      console.log(`Fetching element with ID: ${elementId}`);
      const elementResponse = await axios.get(`${microservices.registry.url}/elements/${elementId}`);
      console.log('Element response:', elementResponse.data);
      expect(elementResponse.status).toBe(200);
      const element = elementResponse.data;

      // Step 2: Create Agreement based on Template and Element
      const agreementPayload = {
          agreementTemplate: {
              id: "PSG2-2526",
              guaranteeModifications: [],
          },
          id: agreementId,
          initialVersion: {
              validity: {
                  start: new Date().toISOString(), 
                  end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  timeZone: "America/Los_Angeles",
              },
              moreInfo: {},
          },
          elementId: "repository1",
      };
      console.log('Creating agreement with the following payload:', agreementPayload);

      const agreementResponse = await axios.post(`${microservices.registry.url}/agreements`, agreementPayload);
      console.log('Agreement creation response:', agreementResponse.data);
      expect(agreementResponse.status).toBe(201);
      const agreement = agreementResponse.data;

      // Step 3: Get Full Agreement
      console.log(`Fetching full agreement with ID: ${agreementId}`);
      const fullAgreementResponse = await axios.get(`${microservices.registry.url}/agreements/${agreementId}?full=true`);
      console.log('Full agreement response:', fullAgreementResponse.data);
      expect(fullAgreementResponse.status).toBe(200);
      const fullAgreement = fullAgreementResponse.data;

      

      // Step 4: Format Full Agreement for Audit
      const formattedAgreement = {
        id: fullAgreement.id,
        version: fullAgreement.versions.find((v) => v.id === versionId),
      };
      console.log('Formatted agreement for audit:', formattedAgreement);

      // Step 5: Generate Audit Report
      const reportPayload = {
        agreement: formattedAgreement,
        periods: null,
        selectedGuarantees: null,
        element: element,
      };
      console.log('Generating audit report with the following payload:', reportPayload);

      const reportResponse = await axios.post(`${microservices.reporter.url}/reports/generate`, reportPayload);
      console.log('Audit report response:', reportResponse.data);
      expect(reportResponse.status).toBe(200);
      const report = reportResponse.data;

      // Verify the generated report
      expect(report).toBeDefined();
      expect(report.summary).toHaveLength(3);

      // Validate the first summary entry
      expect(report.summary[0]).toMatchObject({
        guaranteeId: 'GITHUB_TEAM_NUMBER_COMMITS',
        elementId: 'repository1',
        numericExpressionValue: 3,
        comparator: '<=',
        threshold: 5,
        compliant: true,
      });

      // Validate the second summary entry
      expect(report.summary[1]).toMatchObject({
        guaranteeId: 'GITHUB_MEMBER_CONTRIBUTION_PERCENTAGE',
        elementId: 'repository1',
        elementPartId: 'member1',
        numericExpressionValue: 33.33333333333333,
        comparator: '>=',
        threshold: 15,
        compliant: true,
      });

      // Validate the third summary entry
      expect(report.summary[2]).toMatchObject({
        guaranteeId: 'GITHUB_MEMBER_CONTRIBUTION_PERCENTAGE',
        elementId: 'repository1',
        elementPartId: 'member2',
        numericExpressionValue: 66.66666666666666,
        comparator: '>=',
        threshold: 15,
        compliant: true,
      });

      console.log('Audit Report summary validated successfully.');
    } catch (error) {
      console.error('Test failed with error:', error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error; // Re-throw the error to fail the test
    }
  });
});

describe('End-to-End Test with Guarantee Modifications', () => {
  it('should execute the usecase flow with guarantee modifications successfully', async () => {
    const agreementId = 'test-agreement-modified';
    const versionId = 1;

    try {
      // Step 1: Get Element from Registry Service
      const elementId = 'repository1';
      console.log(`Fetching element with ID: ${elementId}`);
      const elementResponse = await axios.get(`${microservices.registry.url}/elements/${elementId}`);
      console.log('Element response:', elementResponse.data);
      expect(elementResponse.status).toBe(200);
      const element = elementResponse.data;

      // Step 2: Create Agreement based on Template and Element with Guarantee Modifications
      const agreementPayload = {
          agreementTemplate: {
              id: "PSG2-2526",
              guaranteeModifications: [
                  {
                      guaranteeTemplateId: "GITHUB_MEMBER_CONTRIBUTION_PERCENTAGE",
                      parts: ["member1"]
                  }
              ],
          },
          id: agreementId,
          initialVersion: {
              validity: {
                  start: new Date().toISOString(), 
                  end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  timeZone: "America/Los_Angeles",
              },
              moreInfo: {},
          },
          elementId: "repository1",
      };
      console.log('Creating agreement with the following payload:', agreementPayload);

      const agreementResponse = await axios.post(`${microservices.registry.url}/agreements`, agreementPayload);
      console.log('Agreement creation response:', agreementResponse.data);
      expect(agreementResponse.status).toBe(201);
      const agreement = agreementResponse.data;

      // Step 3: Get Full Agreement
      console.log(`Fetching full agreement with ID: ${agreementId}`);
      const fullAgreementResponse = await axios.get(`${microservices.registry.url}/agreements/${agreementId}?full=true`);
      console.log('Full agreement response:', fullAgreementResponse.data);
      expect(fullAgreementResponse.status).toBe(200);
      const fullAgreement = fullAgreementResponse.data;

      // Step 4: Format Full Agreement for Audit
      const formattedAgreement = {
        id: fullAgreement.id,
        version: fullAgreement.versions.find((v) => v.id === versionId),
      };
      console.log('Formatted agreement for audit:', formattedAgreement);

      // Step 5: Generate Audit Report
      const reportPayload = {
        agreement: formattedAgreement,
        periods: null,
        selectedGuarantees: null,
        element: element,
      };
      console.log('Generating audit report with the following payload:', reportPayload);

      const reportResponse = await axios.post(`${microservices.reporter.url}/reports/generate`, reportPayload);
      console.log('Audit report response:', reportResponse.data);
      expect(reportResponse.status).toBe(200);
      const report = reportResponse.data;

      // Verify the generated report
      expect(report).toBeDefined();
      expect(report.summary).toHaveLength(2);

      // Validate the first summary entry
      expect(report.summary[0]).toMatchObject({
        guaranteeId: 'GITHUB_TEAM_NUMBER_COMMITS',
        elementId: 'repository1',
        numericExpressionValue: 3,
        comparator: '<=',
        threshold: 5,
        compliant: true,
      });

      // Validate the second summary entry
      expect(report.summary[1]).toMatchObject({
        guaranteeId: 'GITHUB_MEMBER_CONTRIBUTION_PERCENTAGE',
        elementId: 'repository1',
        elementPartId: 'member1',
        numericExpressionValue: 33.33333333333333,
        comparator: '>=',
        threshold: 15,
        compliant: true,
      });

      console.log('Audit Report summary validated successfully.');
    } catch (error) {
      console.error('Test failed with error:', error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error; // Re-throw the error to fail the test
    }
  });
});
