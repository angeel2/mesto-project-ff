export function createCard(
  cardData,
  userId,
  handleDeleteClick,
  handleLikeClick,
  handleImageClick,
  template
) {
  const cardElement = template.querySelector('.card').cloneNode(true);
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const deleteButton = cardElement.querySelector('.card__delete-button');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes ? cardData.likes.length : 0;

  cardElement.dataset.cardId = cardData._id;

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      handleDeleteClick(cardData._id, cardElement);
    });
  }

  const isLiked = cardData.likes?.some(like => like._id === userId) || false;
  if (isLiked) {
    likeButton.classList.add('card__like-button_is-active');
  }

  likeButton.addEventListener('click', (evt) => {
    evt.stopPropagation();
    handleLikeClick(cardElement);
  });

  cardImage.addEventListener('click', () => handleImageClick(cardData));

  return cardElement;
}