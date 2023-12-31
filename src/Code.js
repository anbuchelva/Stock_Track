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
      } else if (callback_query !== undefined) {
        var {
          from: { id: chatId },
          message: { message_id: messageId, text: callbackText },
          data,
        } = callback_query;
      }
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
  if (data === 'distance_vs_range') {
    // sendDistanceRange(chatId);
  } else if (data === 'distance_vs_efficiency') {
    // sendDistanceEfficiency(chatId);
  }
}

function processText(message, chatId) {
  if (message.text === '/start') {
    sendToTelegram(chatId, '🙏 <b>Welcome to Investment Tracking Bot</b> 🙏', startKeyboard);
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
      var dateTime = new Date(data['date_time']);
      var stock = data['stock'];
      var TransactionType = data['txn_type'];
      var quantity = data['quantity'];
      if (TransactionType == 'Sell') {
        quantity *= -1;
      }
      var average_price = data['price'];
      var total_price = average_price * quantity;
      var notes = data['notes'];
      var messageId = Number(webAppData['message_id']);
      newTransaction = [
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
      var lastRow = transactionSheet.getLastRow();
      transactionSheet.getRange(lastRow + 1, 1, 1, 11).setValues([newTransaction]);
      var messageText = '💵 A new transactions has been added\n' + '\nStock: ' + stock + '\nQuantity: ' + quantity + '\nPrice: ' + price;
      var response = sendToTelegram(chatId, messageText);
      var jsonResponse = JSON.parse(response.getContentText());
      var messageID = jsonResponse.result.message_id;
      // }
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
