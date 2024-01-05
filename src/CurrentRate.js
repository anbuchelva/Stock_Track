  var priceHistorySheetLastRow = priceHistorySheet.getLastRow();
  var priceHistorySheetLastCol = priceHistorySheet.getLastColumn();
  var stocks = priceHistorySheet.getRange(2, 2, priceHistorySheetLastRow - 1, 2).getValues();
  var lastUpdatedDate = priceHistorySheet.getRange(1, priceHistorySheetLastCol).getValue();
  var currentDate = new Date().toLocaleDateString();
  // if the price updated on the same date, replace the column
  if (currentDate == lastUpdatedDate) {
    priceHistorySheetLastRow - 1;
  }
  var stockPriceListPrice = [[currentDate]];
  // var stockPriceListStock = []
  for (let i = 0; i < stocks.length; i++) {
    Logger.log('extracting data for ' + stocks[i][0]);
    var stockPrice = getLastPrice(stocks[i][1]);
    if (stockPrice) {
      stockPriceListPrice.push([stockPrice]);
    } else {
      stockPriceListPrice.push(['']); // if price is not retrieved
    }
  }
  priceHistorySheet.getRange(1, priceHistorySheetLastCol + 1, stockPriceListPrice.length, 1).setValues(stockPriceListPrice);
  sendToTelegram(chatId, '✅ Prices update is completed!');
}

function getLastPrice(url) {
  var regexInput = /<bdo[^>]*class="last-price-value[^>]*>([^<]+)<\/bdo>/;
  var output = '';
  try {
    var fetchedUrl = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (fetchedUrl.getResponseCode() == 200) {
      var html = fetchedUrl.getContentText();
      var match = html.match(regexInput);
      if (match && match[1]) {
        var lastPriceString = match[1].trim();
        var lastPrice = parseFloat(lastPriceString.replace(/,/g, ''));
        return lastPrice;
      } else {
        Logger.log('No match found.');
        return false;
      }
    }
  } catch (error) {
    Logger.log('Error fetching or processing data:', error);
    return false;
  }
  // // Grace period to not overload
  // Utilities.sleep(1000);
}
