

 function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('Custom scripts')
		.addItem('Sync from MRP Easy', 'syncFromMRPEasy')
		.addToUi();

		syncFromMRPEasy();
}



