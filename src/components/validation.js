export function enableValidation(settings) {
  const forms = document.querySelectorAll(settings.formSelector);
  
  forms.forEach(form => {
    setupFormValidation(form, settings);
  });
}

function setupFormValidation(form, settings) {
  const inputs = Array.from(form.querySelectorAll(settings.inputSelector));
  const submitButton = form.querySelector(settings.submitButtonSelector);
  
  inputs.forEach(input => {
    if (input.name === 'name' || input.name === 'place-name') {
      input.pattern = '^[a-zA-Zа-яА-ЯёЁ\\s-]+$';
      input.dataset.errorMessage = 'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы';
    }
    
    input.addEventListener('input', () => handleInputValidation(form, input, inputs, submitButton, settings));
    input.addEventListener('blur', () => handleInputValidation(form, input, inputs, submitButton, settings));
  });
  
  toggleButtonState(inputs, submitButton, settings);
}

function handleInputValidation(form, input, inputs, submitButton, settings) {
  const errorElement = form.querySelector(`.popup__error_type_${getErrorId(input)}`);
  validateInput(input, errorElement, settings);
  toggleButtonState(inputs, submitButton, settings);
}

function validateInput(input, errorElement, settings) {
  if (!isInputValid(input)) {
    showInputError(input, errorElement, settings);
  } else {
    hideInputError(input, errorElement, settings);
  }
}

function getErrorId(input) {
  if (input.name === 'place-name') return 'card-name';
  if (input.name === 'link') return 'url';
  if (input.name === 'avatar') return 'avatar';
  return input.name;
}

function isInputValid(input) {
  if (input.name === 'name' || input.name === 'place-name') {
    const regex = new RegExp(input.pattern);
    return regex.test(input.value);
  }
  
  if (input.type === 'url') {
    return isValidUrl(input.value);
  }
  
  return input.validity.valid;
}

function isValidUrl(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function showInputError(input, errorElement, settings) {
  if (!errorElement) return;
  
  input.classList.add(settings.inputErrorClass);
  
  if (input.validity.patternMismatch && input.dataset.errorMessage) {
    errorElement.textContent = input.dataset.errorMessage;
  } else if (input.type === 'url' && !isValidUrl(input.value)) {
    errorElement.textContent = 'Введите корректный URL';
  } else if (input.validity.valueMissing) {
    errorElement.textContent = 'Это поле обязательно для заполнения';
  } else if (input.validity.tooShort || input.validity.tooLong) {
    const min = input.minLength;
    const max = input.maxLength;
    errorElement.textContent = `Должно быть от ${min} до ${max} символов`;
  }
  
  errorElement.classList.add(settings.errorClass);
}

function hideInputError(input, errorElement, settings) {
  if (!errorElement) return;
  
  input.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';
}

function toggleButtonState(inputs, button, settings) {
  if (!button) return;
  
  const isValid = inputs.every(input => isInputValid(input));
  button.disabled = !isValid;
  button.classList.toggle(settings.inactiveButtonClass, !isValid);
}

export function clearValidation(form, settings) {
  const inputs = form.querySelectorAll(settings.inputSelector);
  const submitButton = form.querySelector(settings.submitButtonSelector);
  
  inputs.forEach(input => {
    const errorElement = form.querySelector(`.popup__error_type_${getErrorId(input)}`);
    hideInputError(input, errorElement, settings);
  });
  
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add(settings.inactiveButtonClass);
  }
}