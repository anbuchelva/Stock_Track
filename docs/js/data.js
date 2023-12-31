// Retrieve the encryption key and IV from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const encryptionKey = urlParams.get('key');
const key = CryptoJS.enc.Utf8.parse(encryptionKey);
const ivString = urlParams.get('iv');
const iv = CryptoJS.enc.Hex.parse(ivString);

async function decryptData(encFile) {
  try {
    const response = await fetch(encFile);
    const encData = await response.text();
    var decryptedData = CryptoJS.AES.decrypt(encData, key, { iv }).toString(CryptoJS.enc.Utf8);
    decryptedJson = JSON.parse(decryptedData);
    // console.log(decryptedJson);
    return decryptedJson;
  } catch (error) {
    console.error(error);
  }
}

function getDecryptedData(encryptedFile) {
  decryptData(encryptedFile)
    .then((decryptedJson) => {
      return decryptedJson;
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateDropDown(data, sourceColHeader, targetElementID, conditionColHeader, conditionVal) {
  try {
    var element = document.getElementById(targetElementID);
    var uniqueValues = new Set();
    data.forEach((item) => {
      var value = item[sourceColHeader];
      if (!uniqueValues.has(value)) {
        if (item[conditionColHeader] == conditionVal) {
          var option = document.createElement('option');
          option.text = value;
          element.appendChild(option);
          uniqueValues.add(value); // Add value to Set
        }
      }
    });
    element.selectedIndex = 0;
  } catch (err) {
    console.log(err.message);
  }
}

decryptData('data/stock_list.txt')
  .then((decryptedData) => {
    updateDropDown(decryptedData, 'stock', 'stock', 'hide', 'No');
  })
  .catch((error) => {
    console.error(error);
  });

// Get current date and time
function getDateTime() {
  var now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// Update the current date and time in the local datetime field
window.onload = function () {
  document.getElementById('date').value = getDateTime();
};
