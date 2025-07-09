import "./index.css";
import { createCard } from "./components/card.js";
import { openModal, closeModal } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getProfileInfo,
  getInitialCards,
  updateProfileInfo,
  addNewCard,
  deleteCard,
  addLike,
  removeLike,
  updateProfileAvatar,
} from "./components/api.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const elements = {
  cardTemplate: document.querySelector("#card-template").content,
  placesList: document.querySelector(".places__list"),
  editForm: document.forms["edit-profile"],
  newCardForm: document.forms["new-place"],
  editAvatarForm: document.forms["edit-avatar"],
  profileName: document.querySelector(".profile__title"),
  profileJob: document.querySelector(".profile__description"),
  profileImage: document.querySelector(".profile__image"),
  editProfileButton: document.querySelector(".profile__edit-button"),
  addCardButton: document.querySelector(".profile__add-button"),
  editAvatarButton: document.querySelector(".profile__image-edit-button"),
  editPopup: document.querySelector(".popup_type_edit"),
  newCardPopup: document.querySelector(".popup_type_new-card"),
  imagePopup: document.querySelector(".popup_type_image"),
  deletePopup: document.querySelector(".popup_type_delete-card"),
  editAvatarPopup: document.querySelector(".popup_type_edit-avatar"),
};

let currentUserId = null;

const setButtonState = (button, isLoading, defaultText = "Сохранить") => {
  button.textContent = isLoading ? "Сохранение..." : defaultText;
  button.disabled = isLoading;
};

const showNotification = (message, duration = 3000) => {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, duration);
};

const handleCardLike = async (cardElement) => {
  const cardId = cardElement.dataset.cardId;
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  try {
    likeButton.disabled = true;
    const updatedCard = isLiked
      ? await removeLike(cardId)
      : await addLike(cardId);
    likeCount.textContent = updatedCard.likes.length;
    likeButton.classList.toggle("card__like-button_is-active");
  } catch (error) {
    showNotification("Ошибка при обновлении лайка");
    console.error("Like error:", error);
  } finally {
    likeButton.disabled = false;
  }
};

const handleCardDelete = async (cardElement) => {
  const cardId = cardElement.dataset.cardId;

  if (!cardId) {
    console.error("Card ID not found in dataset");
    return;
  }

  openModal(elements.deletePopup);

  const confirmButton = elements.deletePopup.querySelector(".popup__button");
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.replaceWith(newConfirmButton);

  newConfirmButton.onclick = async () => {
    try {
      setButtonState(newConfirmButton, true, "Удаление...");
      await deleteCard(cardId);
      cardElement.remove();
      closeModal(elements.deletePopup);
    } catch (error) {
      showNotification("Не удалось удалить карточку");
      console.error("Delete error:", error);
    } finally {
      setButtonState(newConfirmButton, false, "Да");
    }
  };
};

const showImagePopup = (cardElement) => {
  const popupImage = elements.imagePopup.querySelector(".popup__image");
  const popupCaption = elements.imagePopup.querySelector(".popup__caption");

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");

  if (!cardImage || !cardTitle) {
    console.error("Card image or title not found");
    return;
  }

  popupImage.src = cardImage.src;
  popupImage.alt = cardImage.alt || cardTitle.textContent;
  popupCaption.textContent = cardTitle.textContent;

  openModal(elements.imagePopup);
};

const createCardElement = (cardData) => {
  try {
    return createCard(
      cardData,
      currentUserId,
      (element) => handleCardDelete(element),
      (element) => handleCardLike(element),
      (element) => showImagePopup(element),
      elements.cardTemplate
    );
  } catch (error) {
    console.error("Error creating card:", error);
    const errorElement = document.createElement("div");
    errorElement.className = "card-error";
    errorElement.textContent = "Ошибка загрузки карточки";
    return errorElement;
  }
};

const displayUserInfo = (userData) => {
  if (!userData) return;

  elements.profileName.textContent = userData.name || "";
  elements.profileJob.textContent = userData.about || "";
  if (userData.avatar) {
    elements.profileImage.style.backgroundImage = `url('${userData.avatar}')`;
  }
};

const renderCards = (cards) => {
  if (!cards || !Array.isArray(cards)) {
    console.error("Invalid cards data");
    return;
  }

  elements.placesList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const cardElement = createCardElement(card);
    if (cardElement) {
      fragment.appendChild(cardElement);
    }
  });

  elements.placesList.appendChild(fragment);
};

const loadInitialData = async () => {
  try {
    const [userData, cards] = await Promise.all([
      getProfileInfo().catch((e) => {
        throw new Error("Ошибка загрузки профиля");
      }),
      getInitialCards().catch((e) => {
        throw new Error("Ошибка загрузки карточек");
      }),
    ]);

    currentUserId = userData._id;
    displayUserInfo(userData);
    renderCards(cards);
  } catch (error) {
    showNotification(error.message || "Ошибка загрузки данных");
    console.error("Initial data error:", error);
  }
};

const handleProfileFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  try {
    setButtonState(submitButton, true);
    const updatedData = await updateProfileInfo(
      elements.editForm.elements.name.value,
      elements.editForm.elements.description.value
    );
    displayUserInfo(updatedData);
    closeModal(elements.editPopup);
  } catch (error) {
    showNotification("Ошибка обновления профиля");
    console.error("Profile update error:", error);
  } finally {
    setButtonState(submitButton, false);
  }
};

const handleCardFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;

  try {
    setButtonState(submitButton, true, "Создание...");
    const newCard = await addNewCard(
      elements.newCardForm.elements["place-name"].value,
      elements.newCardForm.elements.link.value
    );
    elements.placesList.prepend(createCardElement(newCard));
    elements.newCardForm.reset();
    closeModal(elements.newCardPopup);
  } catch (error) {
    showNotification("Ошибка добавления карточки");
    console.error("Add card error:", error);
  } finally {
    setButtonState(submitButton, false, "Создать");
  }
};

const handleAvatarFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const avatarUrl = elements.editAvatarForm.elements.avatar.value.trim();

  if (!avatarUrl) {
    showNotification("Введите URL аватара");
    return;
  }

  try {
    setButtonState(submitButton, true);
    const userData = await updateProfileAvatar(avatarUrl);
    elements.profileImage.style.backgroundImage = `url('${userData.avatar}')`;
    elements.editAvatarForm.reset();
    closeModal(elements.editAvatarPopup);
  } catch (error) {
    showNotification("Ошибка обновления аватара");
    console.error("Avatar update error:", error);
  } finally {
    setButtonState(submitButton, false);
  }
};

const setupEventListeners = () => {
  if (!elements.editProfileButton || !elements.addCardButton) {
    console.error("Required elements not found");
    return;
  }

  elements.editProfileButton.addEventListener("click", () => {
    elements.editForm.elements.name.value = elements.profileName.textContent;
    elements.editForm.elements.description.value =
      elements.profileJob.textContent;
    clearValidation(elements.editForm, validationConfig);
    openModal(elements.editPopup);
  });

  elements.addCardButton.addEventListener("click", () => {
    elements.newCardForm.reset();
    clearValidation(elements.newCardForm, validationConfig);
    openModal(elements.newCardPopup);
  });

  elements.editAvatarButton.addEventListener("click", () => {
    elements.editAvatarForm.reset();
    clearValidation(elements.editAvatarForm, validationConfig);
    openModal(elements.editAvatarPopup);
  });

  document.querySelectorAll(".popup__close").forEach((button) => {
    button.addEventListener("click", () =>
      closeModal(button.closest(".popup"))
    );
  });

  document.querySelectorAll(".popup").forEach((popup) => {
    popup.addEventListener("mousedown", (evt) => {
      if (
        evt.target === popup ||
        evt.target.classList.contains("popup__close")
      ) {
        closeModal(popup);
      }
    });
  });

  elements.editForm.addEventListener("submit", handleProfileFormSubmit);
  elements.newCardForm.addEventListener("submit", handleCardFormSubmit);
  elements.editAvatarForm.addEventListener("submit", handleAvatarFormSubmit);
};

const initializeApp = () => {
  enableValidation(validationConfig);
  setupEventListeners();
  loadInitialData();
};

initializeApp();
