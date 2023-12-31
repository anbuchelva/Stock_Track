// Encrypt data using AES encryption
function encryptData(jsonData) {
  const cdnjs = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js';
  eval(UrlFetchApp.fetch(cdnjs).getContentText());
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  // const iv = CryptoJS.enc.Utf8.parse(generateRandomNumber());
  const iv = CryptoJS.enc.Hex.parse(IV_STRING);
  const jsonString = JSON.stringify(jsonData);
  const encryptedData = CryptoJS.AES.encrypt(jsonString, key, { iv }).toString();
  return encryptedData;
}

// Convert sheet data to JSON
function exportSheetToJson(sheetName, startRow, startCol, numCol) {
  const data = sheetName.getRange(startRow, startCol, sheetName.getLastRow() - startRow + 1, numCol).getValues();
  const headers = data[0];
  const jsonData = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const jsonRow = {};
    for (let j = 0; j < headers.length; j++) {
      jsonRow[headers[j]] = row[j];
    }
    jsonData.push(jsonRow);
  }
  // Logger.log(jsonData)
  return jsonData;
}

function pushFileToGithub(jsonFile, fileName) {
  var apiUrl = 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contents/' + filePath + fileName;

  var options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + githubToken,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var result = JSON.parse(response.getContentText());
    var sha = result.sha;

    options = {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + githubToken,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      payload: JSON.stringify({
        message: 'Add ' + fileName + ' via Google App Script',
        content: Utilities.base64Encode(jsonFile),
        sha: sha,
        branch: branch,
      }),
    };
  } catch (error) {
    options = {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + githubToken,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      payload: JSON.stringify({
        message: 'Create ' + fileName,
        content: Utilities.base64Encode(jsonFile),
        branch: branch,
      }),
    };
  }

  response = UrlFetchApp.fetch(apiUrl, options);
  result = JSON.parse(response.getContentText());

  if (response.getResponseCode() === 200 || response.getResponseCode() === 201) {
    Logger.log('File saved to GitHub:' + fileName);
  } else {
    Logger.log('Failed to save file to GitHub:' + fileName);
  }
}

function updateFilesToGithub() {
  const stockList = exportSheetToJson(stocksSheet, 2, 2, 1);
  const encryptedStockList = encryptData(stockList);
  pushFileToGithub(encryptedStockList, 'stock_list.txt');
}
