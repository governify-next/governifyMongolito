const WINDOW_TO_BE_DETERMINED = "TO_BE_DETERMINED";

const generateReport = (agreement, periods=[], selectedGuarantees, element) => {
    if (selectedGuarantees) {
        console.log("Selected guarantees not implemented yet");
        return;
    }
    const fullResults = [];
    const results = [];

    for (const guarantee of agreement.version.contract.guarantees) {
      const { metrics, numericExpression, comparator, threshold } = guarantee;

      const elementAuditConfig = element.auditConfig;
      let elementPartAuditConfig = null;
      if(element.parts)
        elementPartAuditConfig = element.parts.find(part => part.id === guarantee.config.elementPartId)?.auditConfig;

      const processedMetrics = metrics.map(metric => {
        const processedMetric = processMetric(metric.id, elementAuditConfig, elementPartAuditConfig);
        return { id: metric.id, value: processedMetric.number, evidences: processedMetric.evidences };
      });
        console.log("Numeric expression:", numericExpression);
        const replacedExpression = numericExpression.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
      const metric = processedMetrics.find(m => m.id === match);
      return metric ? metric.value : match;
    });
        console.log("Replaced expression:", replacedExpression);
      const numericExpressionValue = eval(replacedExpression);
      console.log("Numeric expression value:", numericExpressionValue);

      const resultId = Math.random().toString(36).substring(2, 15);

      fullResults.push({
        id: resultId,
        guaranteeId: guarantee.id,
        elementId: guarantee.config.elementId,
        elementPartId: guarantee.config.elementPartId,
        window: WINDOW_TO_BE_DETERMINED,
        numericExpressionValue: numericExpressionValue,
        comparator: comparator,
        threshold: threshold,
        compliant: comparators[comparator](numericExpressionValue, threshold),
        evidences: processedMetrics
      });
        results.push({
            fullReportId: resultId,
            guaranteeId: guarantee.id,
            elementId: guarantee.config.elementId,
            elementPartId: guarantee.config.elementPartId,
            window: WINDOW_TO_BE_DETERMINED,
            numericExpressionValue: numericExpressionValue,
            comparator: comparator,
            threshold: threshold,
            compliant: comparators[comparator](numericExpressionValue, threshold),
        });
    }
    return { summary: results, fullReport: fullResults };
}

const comparators = {
    ">": (a, b) => a > b,
    ">=": (a, b) => a >= b,
    "<": (a, b) => a < b,
    "<=": (a, b) => a <= b,
    "=": (a, b) => a === b,
    "!=": (a, b) => a !== b
}

const savedMetrics = {
    "GITHUB_TEAM_NUMBER_COMMITS": {},
    "GITHUB_MEMBER_NUMBER_COMMITS": {}
    
};


// todo types of data: screenshot, cummulative,...
//raw data = fetchings.
const rawData = [
    {
        id: "FETCH_COMMIT_FROM_GITHUB_REPOSITORY",
        elementId: "repository1",
        captureDate: "2024-01-15T20:00:00Z",
        rawData: [
            { type: "commit", title: "Commit 1",  author: "pedro", date: "2024-01-10T00:00:00Z" },
            { type: "commit", title: "Commit 2",  author: "juan", date: "2024-01-12T00:00:00Z" }
        ]  
    },
    {
        id: "FETCH_COMMIT_FROM_GITHUB_REPOSITORY",
        elementId: "repository1",
        captureDate: "2024-01-15T21:00:00Z",
        rawData: [
            { type: "commit", title: "Commit 1: modifed",  author: "pedro", date: "2024-01-10T00:00:00Z" },
            { type: "commit", title: "Commit 2",  author: "juan", date: "2024-01-12T00:00:00Z" },
            { type: "commit", title: "Commit 3",  author: "pedro", date: "2024-01-15T20:30:00Z" }
        ]
    }
];

function GITHUB_TEAM_NUMBER_COMMITS() {
    const result = [];
    for (const data of rawData[rawData.length - 1].rawData) {
        result.push(data);
    }
    return { number: result.length, evidences: result };
}

function GITHUB_MEMBER_NUMBER_COMMITS(elementPartAuditConfig) {
    const result = [];
    for (const data of rawData[rawData.length - 1].rawData) {
        console.log(elementPartAuditConfig)
        if(data.author === elementPartAuditConfig.credentials.github.username) {
            result.push(data);
        }
    }
    return { number: result.length, evidences: result };
}

const processMetric = (metricId, elementAuditConfig, elementPartAuditConfig) => {
    switch (metricId) {
        case 'GITHUB_TEAM_NUMBER_COMMITS':
            return GITHUB_TEAM_NUMBER_COMMITS();

        case 'GITHUB_MEMBER_NUMBER_COMMITS':
            return GITHUB_MEMBER_NUMBER_COMMITS(elementPartAuditConfig);
                 
        default:
            return null;
    }
}

export default {
    generateReport
};