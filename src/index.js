import './index.css';
import { createCard } from './components/card.js';
import { openModal, closeModal } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import {
  getProfileInfo,
  getInitialCards,
  updateProfileInfo,
  addNewCard,
  deleteCard,
  addLike,
  removeLike,
  updateProfileAvatar
} from './components/api.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const elements = {
  cardTemplate: document.querySelector('#card-template').content,
  placesList: document.querySelector('.places__list'),
  editForm: document.forms['edit-profile'],
  newCardForm: document.forms['new-place'],
  editAvatarForm: document.forms['edit-avatar'],
  profileName: document.querySelector('.profile__title'),
  profileJob: document.querySelector('.profile__description'),
  profileImage: document.querySelector('.profile__image'),
  editProfileButton: document.querySelector('.profile__edit-button'),
  addCardButton: document.querySelector('.profile__add-button'),
  editAvatarButton: document.querySelector('.profile__image-edit-button'),
  editPopup: document.querySelector('.popup_type_edit'),
  newCardPopup: document.querySelector('.popup_type_new-card'),
  imagePopup: document.querySelector('.popup_type_image'),
  deletePopup: document.querySelector('.popup_type_delete-card'),
  editAvatarPopup: document.querySelector('.popup_type_edit-avatar')
};

let currentUserId;

const setButtonState = (button, isLoading, text = 'Сохранить') => {
  button.textContent = isLoading ? 'Сохранение...' : text;
  button.disabled = isLoading;
};

const handleCardLike = async (cardElement) => {
  const cardId = cardElement.dataset.cardId;
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  try {
    likeButton.disabled = true;
    const updatedCard = isLiked ? await removeLike(cardId) : await addLike(cardId);
    likeCount.textContent = updatedCard.likes.length;
    likeButton.classList.toggle('card__like-button_is-active');
  } catch (error) {
    showNotification('Ошибка при обновлении лайка');
  } finally {
    likeButton.disabled = false;
  }
};

const handleCardDelete = async (cardId, cardElement) => {
  openModal(elements.deletePopup);
  
  const confirmButton = elements.deletePopup.querySelector('.popup__button');
  const handleConfirm = async () => {
    try {
      setButtonState(confirmButton, true, 'Удаление...');
      await deleteCard(cardId);
      cardElement.remove();
      closeModal(elements.deletePopup);
    } catch (error) {
      showNotification('Не удалось удалить карточку');
    } finally {
      setButtonState(confirmButton, false, 'Да');
    }
  };

  confirmButton.addEventListener('click', handleConfirm, { once: true });
};

const createCardElement = (cardData) => {
  return createCard(
    cardData,
    currentUserId,
    handleCardDelete,
    handleCardLike,
    () => showImagePopup(cardData),
    elements.cardTemplate
  );
};

const initializeApp = () => {
  enableValidation(validationConfig);
  setupEventListeners();
  loadInitialData();
};

const loadInitialData = async () => {
  try {
    const [userData, cards] = await Promise.all([
      getProfileInfo(),
      getInitialCards()
    ]);
    
    currentUserId = userData._id;
    displayUserInfo(userData);
    renderCards(cards);
  } catch (error) {
    showNotification('Ошибка загрузки данных');
  }
};

const displayUserInfo = (userData) => {
  elements.profileName.textContent = userData.name;
  elements.profileJob.textContent = userData.about;
  if (userData.avatar) {
    elements.profileImage.style.backgroundImage = `url('${userData.avatar}')`;
  }
};

const renderCards = (cards) => {
  elements.placesList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  cards.forEach(card => fragment.append(createCardElement(card)));
  elements.placesList.append(fragment);
};

const showNotification = (message) => {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.append(notification);
  
  setTimeout(() => notification.remove(), 3000);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const showImagePopup = (cardData) => {
  const popupImage = elements.imagePopup.querySelector('.popup__image');
  const popupCaption = elements.imagePopup.querySelector('.popup__caption');

  popupImage.src = cardData.link;
  popupImage.alt = cardData.name;
  popupCaption.textContent = cardData.name;

  openModal(elements.imagePopup);
};

const openProfileEditPopup = () => {
  elements.editForm.elements.name.value = elements.profileName.textContent;
  elements.editForm.elements.description.value = elements.profileJob.textContent;
  clearValidation(elements.editForm, validationConfig);
  openModal(elements.editPopup);
};

const openCardAddPopup = () => {
  elements.newCardForm.reset();
  clearValidation(elements.newCardForm, validationConfig);
  openModal(elements.newCardPopup);
};

const openAvatarEditPopup = () => {
  elements.editAvatarForm.reset();
  clearValidation(elements.editAvatarForm, validationConfig);
  openModal(elements.editAvatarPopup);
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
    showNotification('Ошибка обновления профиля');
  } finally {
    setButtonState(submitButton, false);
  }
};

const handleCardFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  
  try {
    setButtonState(submitButton, true, 'Создание...');
    const newCard = await addNewCard(
      elements.newCardForm.elements['place-name'].value,
      elements.newCardForm.elements.link.value
    );
    elements.placesList.prepend(createCardElement(newCard));
    elements.newCardForm.reset();
    closeModal(elements.newCardPopup);
  } catch (error) {
    showNotification('Ошибка добавления карточки');
  } finally {
    setButtonState(submitButton, false, 'Создать');
  }
};

const handleAvatarFormSubmit = async (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const avatarUrl = elements.editAvatarForm.elements.avatar.value;

  if (!isValidUrl(avatarUrl)) {
    showNotification('Введите корректный URL изображения');
    return;
  }

  try {
    setButtonState(submitButton, true);
    const userData = await updateProfileAvatar(avatarUrl);
    elements.profileImage.style.backgroundImage = `url('${userData.avatar}')`;
    elements.editAvatarForm.reset();
    closeModal(elements.editAvatarPopup);
  } catch (error) {
    showNotification('Ошибка обновления аватара');
  } finally {
    setButtonState(submitButton, false);
  }
};

const setupEventListeners = () => {
  elements.editProfileButton.addEventListener('click', openProfileEditPopup);
  elements.addCardButton.addEventListener('click', openCardAddPopup);
  elements.editAvatarButton.addEventListener('click', openAvatarEditPopup);

  document.querySelectorAll('.popup__close').forEach(button => {
    button.addEventListener('click', () => closeModal(button.closest('.popup')));
  });

  document.querySelectorAll('.popup').forEach(popup => {
    popup.addEventListener('mousedown', (evt) => {
      if (evt.target === popup) closeModal(popup);
    });
  });

  elements.editForm.addEventListener('submit', handleProfileFormSubmit);
  elements.newCardForm.addEventListener('submit', handleCardFormSubmit);
  elements.editAvatarForm.addEventListener('submit', handleAvatarFormSubmit);
};

document.addEventListener('DOMContentLoaded', initializeApp);