import metricService from './metricService.js';

const WINDOW_TO_BE_DETERMINED = "TO_BE_DETERMINED";

const generateState = (agreement, date, element) => {
    const fullResults = [];
    const results = [];

    for (const guarantee of agreement.version.contract.guarantees) {
      const { metrics, numericExpression, comparator, threshold } = guarantee;

      const elementAuditConfig = element.auditConfig;
      let elementPartAuditConfig = null;
      if(element.parts)
        elementPartAuditConfig = element.parts.find(part => part.id === guarantee.config.elementPartId)?.auditConfig;

      const processedMetrics = metrics.map(metric => {
        const processedMetric = metricService.processMetric(metric.id, date, guarantee.window, elementAuditConfig, elementPartAuditConfig);
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

export default {
    generateState
};