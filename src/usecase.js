
import { microservices } from "./index.js"
import axios from "axios"

const execute = async (config) => {
    let {agreementId, versionId} = config
    versionId = parseInt(versionId, 10);

    // Get Element from Scope Service
    const elementId = "repository1"
    const element = (await axios.get(`${microservices.scope.url}/elements/${elementId}`)).data

    // Create Agreement based on Template and Element

    const agreement = (await axios.post(`${microservices.registry.url}/agreements`, {
        agreementTemplateId: "PSG2-2526",
        id: agreementId,
        initialVersion: {
            validity: {
                start: "hoy",
                end: "mañana",
                timeZone: "America/Los_Angeles"
            },
            moreInfo: {}
        },
        element: element
    })).data
    
    // Get Full Agreement
    const fullAgreement = (await axios.get(`${microservices.registry.url}/agreements/${agreementId}?full=true`)).data

    // Format Full Agreement for Audit
    const formattedAgreement = {
        id: fullAgreement.id,
        version: fullAgreement.versions.find(v => v.id === versionId),
    }

    console.log("Formatted Agreement for Audit:", formattedAgreement)

    // Final step generate Audit Report
    const reporterURL = microservices.reporter.url
    axios.post(`${reporterURL}/reports/generate`, {
        agreement: formattedAgreement,
        periods: null,
        selectedGuarantees: null,
        element: element
    }).then(response => {
        const report = response.data
        console.log("Audit Report generated:", report)
    }).catch(error => {
        console.error("Error generating Audit Report:", error.message)
    })
}

export default {
    execute 
}





