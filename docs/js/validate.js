function validateForm(formName) {
  const form = document.getElementById(formName);
  const inputs = form.querySelectorAll('input, select, textarea');
  let isFormValid = true;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (input.required && !input.value) {
      isFormValid = false;
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
  }

  if (!isFormValid) {
    document.getElementById('alert').classList.remove('visually-hidden');
    return;
  }

  return 'true';
}

Telegram.WebApp.MainButton.onClick(() => {
  console.log(title);
  if (title == 'Transactions') {
    var validationStatus = validateForm('transaction-form');
    if (validationStatus) {
      var transactionData = {
        form: title,
        date: date.value,
        stock: stock.value,
        quantity: quantity.value,
        price: price.value,
        notes: notes.value,
      };
      Telegram.WebApp.sendData(JSON.stringify(transactionData));
    }
  }
});
