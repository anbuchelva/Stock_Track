// doPost is for Post requests
function doPost(request) {
  try {
    var requestBody = JSON.parse(request.postData.contents);
    Logger.log(requestBody);
    var { message, callback_query } = requestBody;
    var chatId, messageId, text, callbackType, webAppData, callbackText;
    if (message !== undefined) {
      if (message.text !== undefined) {
        var {
          // from: { id: userId, username: username },
          chat: { id: chatId, first_name: firstName },
          text,
          message_id: messageId,
        } = message;
      } else if (message.web_app_data !== undefined) {
        var {
          // from: { id: userId, username: username },
          chat: { id: chatId, first_name: firstName },
          message_id: messageId,
          web_app_data: webAppData,
        } = message;
      }
    } else if (callback_query !== undefined) {
      var {
        from: { id: chatId },
        message: { message_id: messageId, text: callbackText },
        data,
      } = callback_query;
    }
    if (ALLOWED_USER_IDS.includes(chatId)) {
      if (text !== undefined) {
        processText(message, chatId);
      } else if (callback_query !== undefined) {
        processCallback(data, chatId, messageId, callbackText);
      } else if (webAppData !== undefined) {
        processWebAppData(chatId, messageId, webAppData);
      }
    } else {
      sendToTelegram(chatId, 'Hey ' + firstName + '! This bot is meant for personal use as it handles personal data.');
    }
  } catch (error) {
    sendToTelegram(ADMIN, `Error in doPost(): ${error.message}`);
  }
}

function processCallback(data, chatId, messageId, callbackText) {
  if (data === 'edit_transaction') {
    editTransaction(chatId, messageId, callbackText);
  } else if (data === 'delete_transaction') {
    deleteTransaction(chatId, messageId);
  }
}

function processText(message, chatId) {
  if (message.text === '/start') {
    sendToTelegram(chatId, 'Bot Initiated!', startKeyboard);
  } else if (message.text.toUpperCase() == 'UP') {
    var response = sendToTelegram(chatId, '🔀 Price update is initiated!');
    updateStockPrices();
    sendToTelegram(chatId, '✅ Prices update is completed!');
  } else {
    sendToTelegram(chatId, 'Invalid input.');
  }
}

function chartToImage(chart) {
  // var imageBlob = chart.getBlob(); this line doesn't work for some reason.
  const slides = SlidesApp.openById(SLIDE_ID);
  slides.getSlides()[0].remove();
  const newSlide = slides.appendSlide();
  const imageBlob = newSlide.insertSheetsChartAsImage(chart).getAs('image/jpeg');
  return imageBlob;
}

function processWebAppData(chatId, messageId, webAppData) {
  if (webAppData) {
    var buttonText = webAppData['button_text'];
    var data = JSON.parse(webAppData.data);
    if (buttonText == 'Transactions') {
      var transactionSheetlastRow = transactionSheet.getLastRow();
      var dateTime = new Date(data['date']);
      var stock = data['stock'];
      var TransactionType = data['txn_type'];
      var quantity = data['quantity'];
      if (TransactionType == 'Sell') {
        quantity *= -1;
      }
      var average_price = data['price'];
      var total_price = average_price * quantity;
      var notes = data['notes'];
      var newTransaction = [
        messageId,
        dateTime,
        stock,
        TransactionType,
        quantity,
        average_price,
        total_price,
        extractDate(dateTime).year,
        extractDate(dateTime).month,
        extractDate(dateTime).date,
        notes,
      ];
      var priceBeforeTxn = getPriceInfo(stock);
      transactionSheet.getRange(transactionSheetlastRow + 1, 1, 1, 11).setValues([newTransaction]);
      var priceAfterTxn = getPriceInfo(stock);
      var currentMakketValue = average_price * priceAfterTxn.currentQuantity;
      if (TransactionType === 'Buy') {
        var messageText = '⬇️ There is a buy order\n';
      } else {
        var messageText = '⬆️ There is a sell order\n';
      }
      messageText +=
        '\nStock: ' +
        stock +
        '\nQuantity: ' +
        quantity +
        '\nAverage Price: ' +
        average_price +
        '\nTotal Price: ' +
        total_price +
        '\n\n<b>Status before transaction</b>\nQuantity: ' +
        priceBeforeTxn.currentQuantity +
        '\nAverage Price: ' +
        priceBeforeTxn.averagePrice +
        '\nInvested Amount: ' +
        priceBeforeTxn.investedAmount +
        '\n\n<b>Status after transaction</b>\nQuantity: ' +
        priceAfterTxn.currentQuantity +
        '\nAverage Price: ' +
        priceAfterTxn.averagePrice +
        '\nInvested Amount: ' +
        priceAfterTxn.investedAmount +
        '\n\nCMP: ' +
        currentMakketValue.toFixed(0) +
        '\nP&L: ' +
        (currentMakketValue - priceAfterTxn.investedAmount).toFixed(0) +
        ' | ' +
        (currentMakketValue / priceAfterTxn.investedAmount - 1).toFixed(2) * 100 +
        '%';
      if (notes) {
        messageText += '\nNotes: ' + notes;
      }
      var response = sendToTelegram(chatId, messageText, editEntryKeyboard);
      // var jsonResponse = JSON.parse(response.getContentText());
      // var messageID = jsonResponse.result.message_id;
      // }
    } else if (buttonText == 'New Stock') {
      var stocksSheetLastRow = stocksSheet.getLastRow();
      var priceHistorySheetLastRow = priceHistorySheet.getLastRow();
      var stock = data['stock'];
      var url = data['url'];
      var sector = data['sector'];
      var newStock = [stock, sector];
      var newPriceHistory = [stock, url];
      newStock.unshift(stocksSheetLastRow - 1); //adding ID here.
      newPriceHistory.unshift(priceHistorySheetLastRow); //adding ID here
      stocksSheet.getRange(stocksSheetLastRow + 1, 1, 1, 3).setValues([newStock]);
      priceHistorySheet.getRange(priceHistorySheetLastRow + 1, 1, 1, 3).setValues([newPriceHistory]);
      stocksSheet.getRange(stocksSheetLastRow + 1, 6).activate();
      stocksSheet.getRange(stocksSheetLastRow, 6, 1, 21).copyTo(stocksSheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
      sendToTelegram(chatId, '✅ ' + stock + ' is added!\nYou may refresh the price to get the latest market price.');
      updateFilesToGithub();
      Utilities.sleep(60000);
      sendToTelegram(chatId, '✅ The new stock is updated in github repo as well. You may need to clear the cache of telegram to see it in the drop down.');
    }
  }
}

function extractDate(dateString) {
  var date = new Date(dateString);
  var year = date.getUTCFullYear();
  var month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  var day = date.getUTCDate().toString().padStart(2, '0');
  var yearResult = year;
  var monthResult = year + '-' + month + '-' + 1;
  var dateResult = year + '-' + month + '-' + day;
  return {
    year: yearResult,
    month: monthResult,
    date: dateResult,
  };
}

function getPriceInfo(stock) {
  var priceData = {
    currentQuantity: 0,
    averagePrice: 0,
    currentMarketValue: 0,
  };
  var stocksData = stocksSheet.getDataRange().getValues();

  for (var i = 0; i < stocksData.length; i++) {
    var rowData = stocksData[i];
    var currentStock = rowData[1]; // Assuming stock is in column B

    if (currentStock === stock) {
      priceData = {
        currentQuantity: rowData[6], // Assuming G is the 7th column (index 6)
        averagePrice: parseFloat(rowData[10]).toFixed(2), // Assuming K is the 11th column (index 10)
        investedAmount: parseFloat(rowData[17]).toFixed(0), // Assuming T is the 18th column (index 17)
      };
      break; // Stop searching once a match is found
    }
  }
  return priceData;
}

function editTransaction(chatId, messageId, callbackText) {
  sendToTelegram(chatId, 'Edit option is under development!');
  // resultArray = parseRideLogMsg(callbackText);
  // It doesn't work and requires a fix
  // var resultArray = [];
  // var data = JSON.stringify(resultArray);
  // var parametersEdit = {
  //   keyboard: [
  //     [
  //       {
  //         text: '✏️ Edit',
  //         web_app: {
  //           url:
  //             'https://anbuchelva.in/stock-track/edit-transaction?data=' +
  //             encodeURIComponent(data) +
  //             '&cid=' +
  //             chatId +
  //             '&mid=' +
  //             messageId +
  //             '?key=' +
  //             ENCRYPTION_KEY +
  //             '&iv=' +
  //             IV_STRING,
  //         },
  //       },
  //       { text: '✖️ Cancel Edit' },
  //     ],
  //   ],
  //   is_persistent: false,
  //   resize_keyboard: true,
  //   one_time_keyboard: true,
  // };
  // sendToTelegram(chatId, '⬇️ Click edit button to edit the transaction.', parametersEdit, messageId);
}

function deleteTransaction(chatId, messageId) {
  var lastRow = transactionSheet.getLastRow();
  if (lastRow > 50) {
    var firstRow = lastRow - 49;
    values = transactionSheet.getRange(firstRow, 1, 50, 1).getValues();
  } else if (lastRow > 2) {
    var firstRow = 2;
    values = transactionSheet.getRange(2, 1, lastRow - 1, 1).getValues();
  } else {
    return false;
  }
  for (var i = values.length - 1; i >= 0; i--) {
    if (values[i][0] === messageId) {
      transactionSheet.deleteRow(i + firstRow);
      return sendToTelegram(chatId, '✅ The selected entry has been deleted', null, messageId);
    } else {
      return sendToTelegram(chatId, '❌ Unable to find this entry in the database.', null, messageId);
    }
  }
}
