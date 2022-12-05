"use strict";
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Custom scripts')
        .addItem('Sync from MRP Easy', 'syncFromMRPEasy')
        .addToUi();
    syncFromMRPEasy();
}
function call_MRP_Easy_API(counter) {
    var scriptProperties = PropertiesService.getScriptProperties();
    var MRP_EASY_API_KEY = scriptProperties.getProperty('MRP_EASY_API_KEY');
    var MRP_EASY_ACCESS_KEY = scriptProperties.getProperty('MRP_EASY_ACCESS_KEY');
    var url = 'https://app.mrpeasy.com/rest/v1/lots';
    var method = 'get';
    var options = {
        'method': method,
        'headers': { 'api_key': "".concat(MRP_EASY_API_KEY), 'access_key': "".concat(MRP_EASY_ACCESS_KEY), 'Range': 'items=' + counter, 'accept': 'application/json', 'content-type': 'application/json' }
    };
    var result = UrlFetchApp.fetch(url, options);
    return result;
}
function syncFromMRPEasy() {
    var itemCounter = 0;
    var result = call_MRP_Easy_API(itemCounter);
    var output = [];
    do {
        if (result.getResponseCode() === 206 || result.getResponseCode() === 200) {
            var resultText = result.getContentText();
            var parsedRecords = parseTableRecords(resultText);
            if (output.length === 0)
                output = [processColumns(parsedRecords.columns)];
            for (var _i = 0, _a = parsedRecords.data; _i < _a.length; _i++) {
                var entry = _a[_i];
                var row = [];
                for (var _b = 0, _c = parsedRecords.columns; _b < _c.length; _b++) {
                    var column = _c[_b];
                    row.push(entry[column]);
                }
                output.push(row);
            }
            itemCounter = itemCounter + 100;
            result = call_MRP_Easy_API(itemCounter);
        }
    } while (JSON.parse(result.getContentText()).length != 0);
    writeToSheet('Stocks', output, { clearSheet: true });
}
function parseTableRecords(resultText) {
    var resultObj = JSON.parse(resultText);
    var parsedTableRecords = {
        columns: [],
        data: []
    };
    for (var _i = 0, resultObj_1 = resultObj; _i < resultObj_1.length; _i++) {
        var lot = resultObj_1[_i];
        var obj = {};
        obj.id = lot.lot_id;
        iterateObject(lot, obj, parsedTableRecords);
        parsedTableRecords.data.push(obj);
    }
    return parsedTableRecords;
}
function iterateObject(lot, obj, parsedTableRecords) {
    for (var _i = 0, _a = Object.keys(lot); _i < _a.length; _i++) {
        var columnn = _a[_i];
        lot[columnn] = formatDates(lot, columnn);
        lot[columnn] = translateStatus(lot, columnn);
        if (lot[columnn] instanceof Array) {
            for (var _b = 0, _c = lot[columnn]; _b < _c.length; _b++) {
                var inner = _c[_b];
                iterateObject(inner, obj, parsedTableRecords);
            }
        }
        else {
            obj[columnn] = lot[columnn];
            if (!parsedTableRecords.columns.includes(columnn)) {
                parsedTableRecords.columns.push(columnn);
            }
        }
    }
}
function convertUnixTimestampToDate(lot, columnn) {
    var original_date = '';
    if (lot[columnn] && lot[columnn] !== '') {
        var todate = new Date(parseInt(lot[columnn]) * 1000).getDate();
        var tomonth = new Date(parseInt(lot[columnn]) * 1000).getMonth() + 1;
        var toyear = new Date(parseInt(lot[columnn]) * 1000).getFullYear();
        original_date = tomonth + '/' + todate + '/' + toyear;
    }
    return original_date;
}
function formatDates(lot, columnn) {
    if (columnn === 'created' || columnn === 'available_from' || columnn === 'custom_16099') {
        return convertUnixTimestampToDate(lot, columnn);
    }
    return lot[columnn];
}
function translateStatus(lot, columnn) {
    if (columnn === 'status') {
        if (lot[columnn] === '10') {
            return 'Planned';
        }
        if (lot[columnn] === '15') {
            return 'On hold';
        }
        if (lot[columnn] === '20') {
            return 'Received';
        }
        if (lot[columnn] === '25') {
            return 'Rejected';
        }
        if (lot[columnn] === '30') {
            return 'Cancelled';
        }
    }
    return lot[columnn];
}
function processColumns(parsedColumns) {
    var filteredColumns = [];
    for (var _i = 0, parsedColumns_1 = parsedColumns; _i < parsedColumns_1.length; _i++) {
        var column = parsedColumns_1[_i];
        if (column === "custom_16099") {
            column = 'Invoice Date';
        }
        if (column === 'custom_16098') {
            column = 'Entity';
        }
        if (column === 'custom_16104') {
            column = 'S/N';
        }
        filteredColumns.push(column);
    }
    return filteredColumns;
}
/**
 * Write a 2D array to a particular sheet within a Google Spreadsheet
 * @param sheetName			Name of sheet where array should be written.
 * 			 				If it does not exist, it is created.
 * @param writeArray		2D array containing data to be written
 * @param startRow			First sheet row for writing array. Defaults to 1,
 * 				   			corresponding to first row. Negative value is
 * 				   			interpreted as "append", and startRow is set to
 * 				   			<last-row-with-content> + 1 at runtime.
 * @param startColumn		First sheet column for writing array. Defaults
 *  				  		to 1, corresponding to first column. Negative
 * 					  		value is interpreted as "append", and startColumn
 * 				   	  		is set to <last-column-with-content> + 1 at
 * 					  		runtime.
 * @param spreadsheet		Relevant Google Spreadsheet. Defaults to
 * 							active spreadsheet.
 * @param templateSheetName Name of sheet to use as template if sheet
 * 							<sheetName> has to be created.
 * @param clearSheet		Whether to clear the sheet content, starting
 * 							at [startRow, startColumn]. Defaults to false.
 * 							Ignored if either startRow or startColumn
 * 							is negative. ("Append" already implies no existing
 * 							content.)
 * @param overwriteRange	Whether to overwrite existing content. Defaults
 * 							to true. If false, writing operation is cancelled
 * 							if any of the cells to be written to already
 * 							have content. Ignored if clearSheet is true, or
 * 							if either startRow or startColumn is
 * 							negative. ("Append" already implies no existing
 * 							content.)
 */
function writeToSheet(sheetName, writeArray, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.startRow, startRow = _c === void 0 ? 1 : _c, _d = _b.startColumn, startColumn = _d === void 0 ? 1 : _d, _e = _b.spreadsheet, spreadsheet = _e === void 0 ? SpreadsheetApp.getActiveSpreadsheet() : _e, templateSheetName = _b.templateSheetName, _f = _b.clearSheet, clearSheet = _f === void 0 ? false : _f, _g = _b.overwriteRange, overwriteRange = _g === void 0 ? true : _g;
    var spreadsheetName = spreadsheet.getName();
    var sheet = spreadsheet.getSheetByName(sheetName);
    // Check whether template was provided:
    var templateSheet;
    if (templateSheetName) {
        templateSheet = spreadsheet.getSheetByName(templateSheetName);
        if (!templateSheet) {
            throw new Error("A template sheet named \"".concat(templateSheetName, "\" does not exist in spreadsheet \"").concat(spreadsheetName, "\"!"));
        }
    }
    // Check for existence of sheet in spreadsheet:
    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName, { template: templateSheet });
        console.log("Sheet ".concat(sheetName, " created in spreadsheet ").concat(spreadsheetName, "."));
    }
    // Sheet dimensions:
    var lastSheetRow = sheet.getLastRow();
    var lastSheetColumn = sheet.getLastColumn();
    // Output dimensions:
    var numOutputRows = writeArray.length;
    var numOutputColumns = writeArray[0].length;
    // Check for negative startRow/startColumn, which imply "append":
    var append = startRow < 0 || startColumn < 0;
    if (startRow < 0) {
        startRow = lastSheetRow + 1;
    }
    if (startColumn < 0) {
        startColumn = lastSheetColumn + 1;
    }
    // Clear appropriate range on sheet:
    if (lastSheetRow >= startRow && lastSheetColumn >= startColumn && !append) {
        var range = void 0;
        if (!clearSheet) {
            range = sheet.getRange(startRow, startColumn, numOutputRows, numOutputColumns);
            if (!overwriteRange) {
                // Check if range is empty:
                if (!range.isBlank()) {
                    throw new Error("Operation would overwrite existing data! Cancelling.");
                }
            }
        }
        else {
            range = sheet.getRange(startRow, startColumn, lastSheetRow - startRow + 1, lastSheetColumn - startColumn + 1);
        }
        range.clearContent();
    }
    // Write output:
    sheet
        .getRange(startRow, startColumn, numOutputRows, numOutputColumns)
        .setValues(writeArray);
    SpreadsheetApp.flush();
    console.log("Successfully wrote output to sheet ".concat(sheetName, " in spreadsheet ").concat(spreadsheetName, "."));
}
