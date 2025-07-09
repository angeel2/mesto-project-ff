export function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  const getErrorElement = (form, input) => {
    const fieldContainer = input.closest(".popup__form-field");
    if (!fieldContainer) return null;
    return fieldContainer.querySelector(".popup__error");
  };

  function setupFormValidation(form, config) {
    const inputs = Array.from(form.querySelectorAll(config.inputSelector));
    const submitButton = form.querySelector(config.submitButtonSelector);

    const toggleButtonState = () => {
      const isValid = inputs.every((input) => input.validity.valid);
      if (submitButton) {
        submitButton.disabled = !isValid;
        submitButton.classList.toggle(config.inactiveButtonClass, !isValid);
      }
    };

    const showInputError = (input) => {
      const errorElement = getErrorElement(form, input);
      if (!errorElement) return;

      input.classList.add(config.inputErrorClass);

      if (input.validity.patternMismatch && input.dataset.errorMessage) {
        errorElement.textContent = input.dataset.errorMessage;
      } else {
        errorElement.textContent = input.validationMessage;
      }

      errorElement.classList.add(config.errorClass);
    };

    const hideInputError = (input) => {
      const errorElement = getErrorElement(form, input);
      if (!errorElement) return;

      input.classList.remove(config.inputErrorClass);
      errorElement.textContent = "";
      errorElement.classList.remove(config.errorClass);
    };

    const validateInput = (input) => {
      if (input.validity.valid) {
        hideInputError(input);
      } else {
        showInputError(input);
      }
      toggleButtonState();
    };

    inputs.forEach((input) => {
      input.addEventListener("input", () => validateInput(input));
      input.addEventListener("blur", () => validateInput(input));
      validateInput(input);
    });

    toggleButtonState();
  }

  forms.forEach((form) => {
    form.addEventListener("submit", (evt) => evt.preventDefault());
    setupFormValidation(form, config);
  });
}

export function clearValidation(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  const submitButton = form.querySelector(config.submitButtonSelector);

  const getErrorElement = (form, input) => {
    const fieldContainer = input.closest(".popup__form-field");
    if (!fieldContainer) return null;
    return fieldContainer.querySelector(".popup__error");
  };

  inputs.forEach((input) => {
    const errorElement = getErrorElement(form, input);
    if (errorElement) {
      input.classList.remove(config.inputErrorClass);
      errorElement.textContent = "";
      errorElement.classList.remove(config.errorClass);
    }
  });

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add(config.inactiveButtonClass);
  }
}
