// doPost is for Post requests
function doPost(request) {
  try {
    var requestBody = JSON.parse(request.postData.contents);
    Logger.log(requestBody);
    var { message, callback_query } = requestBody;
    var chatId, messageId, text, callbackType;
    if (message !== undefined) {
      // Check if the message contains text or photo
      if (message.text !== undefined) {
        var {
          from: { id: userId, username: username },
          chat: { id: chatId, first_name: firstName },
          text,
          message_id: messageId,
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
