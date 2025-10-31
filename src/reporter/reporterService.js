
const generateReport = (contract, periods=[], selectedGuarantees) => {
    if selectedGuarantees {
        console.log("Selected guarantess not implemented yet");
        return;
    }
    for (const guarantee of contract.guarantees) {
        console.log(`Generating report for guarantee: ${guarantee.id}`);
        const guaranteeReport = generateReportForGuarantee(guarantee, periods);
}
