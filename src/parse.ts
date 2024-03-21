function parseTableRecords(resultText: string) {
    const resultObj = JSON.parse(resultText)
    const parsedTableRecords: {
        columns: string[],
        data: { [x: string]: string }[]
    } = {
        columns: [],
        data: []
    }
    for (const resultObjElement of resultObj) {
        iterateObject(resultObjElement, parsedTableRecords)
    }
    return parsedTableRecords
}

function iterateObject(resultObjElement: any,
                       parsedTableRecords: {
                           columns: string[],
                           data: { [x: string]: string }[]
                       }) {

    for (let column of Object.keys(resultObjElement)) {

        resultObjElement[column] = formatDates(resultObjElement, column)
        resultObjElement[column] = translateStatus(resultObjElement, column)

        if (resultObjElement[column] instanceof Array) {
            iterateArrayElement(column, resultObjElement, parsedTableRecords);

        } else {
            if (!parsedTableRecords.columns.includes(column)) {
                parsedTableRecords.columns.push(column)
            }
        }
    }
}

function iterateArrayElement(column: string,
                             resultObjElement: any,
                             parsedTableRecords: {
                                 columns: string[],
                                 data: { [x: string]: string }[]
                             }) {

    for (const inner of resultObjElement[column]) {
        if (typeof inner === 'object' && !Array.isArray(inner)) {
            const newLine = {...resultObjElement};
            for (const innerColumn of Object.keys(inner)) {
                newLine[innerColumn] = inner[innerColumn];

                newLine[innerColumn] = formatDates(newLine, innerColumn)
                newLine[innerColumn] = translateStatus(newLine, innerColumn)

                if (!parsedTableRecords.columns.includes(innerColumn)) {
                    parsedTableRecords.columns.push(innerColumn);
                }
            }
            parsedTableRecords.data.push(newLine);
        }
    }
}

function convertUnixTimestampToDate(lot: any, column: string) {

    let original_date = ''

    if (lot[column] && lot[column] !== '') {
        let todate = new Date(parseInt(lot[column]) * 1000).getDate();
        let tomonth = new Date(parseInt(lot[column]) * 1000).getMonth() + 1;
        let toyear = new Date(parseInt(lot[column]) * 1000).getFullYear();
        original_date = tomonth + '/' + todate + '/' + toyear;
    }

    return original_date
}

function formatDates(lot: any, column: string) {
    if (column === 'created' ||
        column === 'available_from' ||
        column === 'custom_16099' ||
        column === 'expected_date' ||
        column === 'arrival_date' ||
        column === 'order_date' ||
        column === 'custom_16953' ||
        column === 'custom_19713' ||
        column === 'custom_17536') {

        return convertUnixTimestampToDate(lot, column)

    }

    return lot[column]
}


function translateStatus(lot: any, column: string) {

    if (column === 'status') {
        if (lot[column] === '10') {
            return 'New PO'
        }

        if (lot[column] === '15') {
            return 'On hold'
        }

        if (lot[column] === '20') {
            return 'Ordered'
        }

        if (lot[column] === '25') {
            return 'Rejected'
        }
        if (lot[column] === '30') {
            return 'Cancelled'
        }
        if (lot[column] === '5') {
            return 'Requested'
        }
        if (lot[column] === '105') {
            return 'RMA waiting for repair'
        }
        if (lot[column] === '110') {
            return 'RMA ready for shipment'
        }
        if (lot[column] === '115') {
            return 'RMA returned'
        }
        if (lot[column] === '40') {
            return 'Received'
        }
    }

    return lot[column]
}

function processColumns(parsedColumns: string[]) {

    let filteredColumns: string[] = []

    for (let column of parsedColumns) {
        if (column === `custom_16099`) {
            column = 'Invoice Date'
        }

        if (column === 'custom_16098') {
            column = 'Entity'
        }

        if (column === 'custom_16104') {
            column = 'S/N'
        }

        filteredColumns.push(column)

    }

    return filteredColumns

}


