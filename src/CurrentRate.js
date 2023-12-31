const stocksSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Stocks');
const priceHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Price History');

function updateStockPrices() {  
  const stocksSheetLastRow = stocksSheet.getLastRow();
  const stocks = stocksSheet.getRange(2, 2, stocksSheetLastRow - 1, 5).getValues();  
  const priceHistorySheetLastCol = priceHistorySheet.getLastColumn()
  var currentDate = new Date().toLocaleDateString()
  var stockPriceListPrice = [[currentDate]];
  // var stockPriceListStock = []
  for (let i = 0; i < stocks.length; i++) {
    Logger.log("extracting data for " + stocks[i][0])
    var stockPrice = getLastPrice(stocks[i][1])
    if (stockPrice){
      stockPriceListPrice.push([stockPrice]);
      // stockPriceListStock.push([currentDate, stockPrice])
    } else {
      stockPriceListPrice.push([""]);
      // stockPriceListStock.push(["", ""])
    }
  }
  // Update the 'Price History' sheet
  priceHistorySheet.getRange(1,priceHistorySheetLastCol+1, stockPriceListPrice.length, 1).setValues(stockPriceListPrice);
  
  // Update the 'Stocks' sheet
  // stocksSheet.getRange(2, 6, stockPriceListStock.length, 2).setValues(stockPriceListStock);
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
        return lastPrice
      } else {
        Logger.log('No match found.');
        return false
      }
    }
  } catch (error) {
    Logger.log('Error fetching or processing data:', error);
    return false
  }
  // // Grace period to not overload
  // Utilities.sleep(1000);
}
