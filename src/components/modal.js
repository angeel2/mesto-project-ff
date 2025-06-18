function handleEscapeKey(evt) {
  if (evt.key === 'Escape') {
    const openedPopup = document.querySelector('.popup_is-opened');
    if (openedPopup) closeModal(openedPopup);
  }
}

function handleOverlayClick(evt) {
  if (evt.target === evt.currentTarget) {
    closeModal(evt.currentTarget);
  }
}

export function openModal(modal) {
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('popup_is-opened');
  }, 10);
  document.addEventListener('keydown', handleEscapeKey);
  modal.addEventListener('mousedown', handleOverlayClick);
}

export function closeModal(modal) {
  modal.classList.remove('popup_is-opened');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
  document.removeEventListener('keydown', handleEscapeKey);
  modal.removeEventListener('mousedown', handleOverlayClick);
}