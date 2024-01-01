const startKeyboard = {
  keyboard: [
    [
      { text: 'Transactions', web_app: { url: 'https://anbuchelva.in/stock-track/add-transaction?key=' + ENCRYPTION_KEY + '&iv=' + IV_STRING } },
      { text: 'New Stock', web_app: { url: 'https://anbuchelva.in/stock-track/add-new-stock' } },
    ],
  ],
  resize_keyboard: true,
  one_time_keyboard: false,
  // input_field_placeholder: 'Choose an option',
};

var editEntryKeyboard = {
  inline_keyboard: [
    [
      { text: '✏️ Edit', callback_data: 'edit_transaction' },
      { text: '🗑️ Delete', callback_data: 'delete_transaction' },
    ],
  ],
  resize_keyboard: true,
};
