import './index.css';
import { initialCards } from './cards.js';
import { createCard, handleLikeClick, deleteCard } from './components/card.js';
import { openModal, closeModal } from './components/modal.js';

const cardTemplate = document.querySelector("#card-template").content;
const placesContainer = document.querySelector(".places__list");

const editProfilePopup = document.querySelector('.popup_type_edit');
const addCardPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');

const editProfileButton = document.querySelector('.profile__edit-button');
const addCardButton = document.querySelector('.profile__add-button');

const editForm = document.forms['edit-profile'];
const newCardForm = document.forms['new-place'];

const nameInput = editForm.querySelector('.popup__input_type_name');
const jobInput = editForm.querySelector('.popup__input_type_description');

const profileName = document.querySelector('.profile__title');
const profileJob = document.querySelector('.profile__description');

const popupImage = imagePopup.querySelector('.popup__image');
const popupCaption = imagePopup.querySelector('.popup__caption');

function handleImageClick(cardData) {
  popupImage.src = cardData.link;
  popupImage.alt = cardData.name;
  popupCaption.textContent = cardData.name;
  openModal(imagePopup);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  profileName.textContent = nameInput.value;
  profileJob.textContent = jobInput.value;
  closeModal(editProfilePopup);
}

function handleNewCardSubmit(evt) {
  evt.preventDefault();
  const newCardData = {
    name: newCardForm.elements['place-name'].value,
    link: newCardForm.elements.link.value
  };
  
  placesContainer.prepend(
    createCard(newCardData, deleteCard, handleLikeClick, handleImageClick)
  );
  newCardForm.reset();
  closeModal(addCardPopup);
}

editProfileButton.addEventListener('click', () => {
  nameInput.value = profileName.textContent;
  jobInput.value = profileJob.textContent;
  openModal(editProfilePopup);
});

addCardButton.addEventListener('click', () => {
  newCardForm.reset();
  openModal(addCardPopup);
});

document.querySelectorAll('.popup__close').forEach(button => {
  button.addEventListener('click', () => {
    const popup = button.closest('.popup');
    closeModal(popup);
  });
});


editForm.addEventListener('submit', handleProfileFormSubmit);
newCardForm.addEventListener('submit', handleNewCardSubmit);

initialCards.forEach(cardData => {
  placesContainer.append(
    createCard(cardData, deleteCard, handleLikeClick, handleImageClick)
  );
});