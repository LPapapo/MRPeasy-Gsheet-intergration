function call_MRP_Easy_API(counter: number) {

    const scriptProperties = PropertiesService.getScriptProperties();
    const MRP_EASY_API_KEY = scriptProperties.getProperty('MRP_EASY_API_KEY');
    const MRP_EASY_ACCESS_KEY = scriptProperties.getProperty('MRP_EASY_ACCESS_KEY');

    const url = 'https://app.mrpeasy.com/rest/v1/lots';
    const method = 'get';
    const options: any = {
        'method': method,
        'headers': { 'api_key': `${MRP_EASY_API_KEY}`, 'access_key': `${MRP_EASY_ACCESS_KEY}`, 'Range': 'items=' + counter, 'accept': 'application/json', 'content-type': 'application/json' }
    };
    const result = UrlFetchApp.fetch(url, options);
    return result;
}

function syncFromMRPEasy() {
    let itemCounter = 0

    let result = call_MRP_Easy_API(itemCounter);
    let output: string[][] = [];

    do {

        if (result.getResponseCode() === 206 || result.getResponseCode() === 200) {
            const resultText = result.getContentText()
            const parsedRecords = parseTableRecords(resultText)

            if (output.length === 0) output = [processColumns(parsedRecords.columns)]

            for (const entry of parsedRecords.data) {
                const row = []
                for (const column of parsedRecords.columns) {
                    row.push(entry[column])                
                }
                output.push(row)
            }
            itemCounter = itemCounter + 100
            result = call_MRP_Easy_API(itemCounter);
        }

    } while (JSON.parse(result.getContentText()).length != 0)

    writeToSheet('Stocks', output, { clearSheet: true })
}


