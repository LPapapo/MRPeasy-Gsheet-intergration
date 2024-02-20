function parseTableRecords(resultText: string) {
	const resultObj = JSON.parse(resultText)
	const parsedTableRecords: {
		columns: string[],
		data: { [x: string]: string }[]
	} = {
		columns: [],
		data: []
	}
	for (const lot of resultObj) {
		const obj: { [x: string]: string } = {}
		obj.id = lot.lot_id
		iterateObject(lot, obj, parsedTableRecords)
		parsedTableRecords.data.push(obj)
	}
	return parsedTableRecords
}

function iterateObject(lot: any, obj: { [x: string]: string },
	parsedTableRecords: {
		columns: string[],
		data: { [x: string]: string }[]
	}) {

	for (let column of Object.keys(lot)) {

		lot[column] = formatDates(lot, column)
		lot[column] = translateStatus(lot, column)

		if (lot[column] instanceof Array) {

			for (const inner of lot[column]) {
				iterateObject(inner, obj, parsedTableRecords)
			}

		} else {
			obj[column] = lot[column]
			if (!parsedTableRecords.columns.includes(column)) {
				parsedTableRecords.columns.push(column)
			}
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
	if (column === 'created' || column === 'available_from' || column === 'custom_16099' || column === 'expected_date' || column === 'arrival_date' || column === 'order_date' || column === 'custom_16953' || column === 'custom_19713' || column === 'custom_17536') {

		return convertUnixTimestampToDate(lot, column)

	}

	return lot[column]
}


function translateStatus(lot: any, column: string) {

	if (column === 'status') {
		if (lot[column] === '10') {
			return 'Planned'
		}

		if (lot[column] === '15') {
			return 'On hold'
		}

		if (lot[column] === '20') {
			return 'Received'
		}

		if (lot[column] === '25') {
			return 'Rejected'
		}
		if (lot[column] === '30') {
			return 'Cancelled'
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


