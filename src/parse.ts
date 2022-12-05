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

	for (let columnn of Object.keys(lot)) {

		lot[columnn] = formatDates(lot, columnn)
		lot[columnn] = translateStatus(lot, columnn)

		if (lot[columnn] instanceof Array) {

			for (const inner of lot[columnn]) {
				iterateObject(inner, obj, parsedTableRecords)
			}

		} else {
			obj[columnn] = lot[columnn]
			if (!parsedTableRecords.columns.includes(columnn)) {
				parsedTableRecords.columns.push(columnn)
			}
		}
	}
}

function convertUnixTimestampToDate(lot: any, columnn: string) {

	let original_date = ''

	if (lot[columnn] && lot[columnn] !== '') {
		let todate = new Date(parseInt(lot[columnn]) * 1000).getDate();
		let tomonth = new Date(parseInt(lot[columnn]) * 1000).getMonth() + 1;
		let toyear = new Date(parseInt(lot[columnn]) * 1000).getFullYear();
		original_date = tomonth + '/' + todate + '/' + toyear;
	}

	return original_date
}

function formatDates(lot: any, columnn: string) {
	if (columnn === 'created' || columnn === 'available_from' || columnn === 'custom_16099') {

		return convertUnixTimestampToDate(lot, columnn)

	}

	return lot[columnn]
}


function translateStatus(lot: any, columnn: string) {

	if (columnn === 'status') {
		if (lot[columnn] === '10') {
			return 'Planned'
		}

		if (lot[columnn] === '15') {
			return 'On hold'
		}

		if (lot[columnn] === '20') {
			return 'Received'
		}

		if (lot[columnn] === '25') {
			return 'Rejected'
		}
		if (lot[columnn] === '30') {
			return 'Cancelled'
		}
	}

	return lot[columnn]
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


