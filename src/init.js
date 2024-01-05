// Function to update script properties automatically.
const OPTIONS = GSHEETS.getSheetByName('options');
function updatedScriptProperties() {
  var userInputs = OPTIONS.getRange('A2:B11').getValues();
  // userInputs.push(['AUTO_TRIGGER', 'TRUE']);
  for (var i = 0; i < userInputs.length; i++) {
    var key = userInputs[i][0];
    var value = String(userInputs[i][1]);

    if (value === null || value === "") {
      throw new Error("Please fill in all the cells in the range B2:B11");
    } else {
      PropertiesService.getScriptProperties().setProperty(key, value);
    }
  }
  logMessage("Script Properties are updated!");
}

function logMessage(value) {
  logSheet.appendRow([new Date(), value]);
}
