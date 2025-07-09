export function createCard(
  cardData,
  userId,
  handleDeleteClick,
  handleLikeClick,
  handleImageClick,
  template
) {
  if (!template) {
    throw new Error("Template not provided");
  }

  const templateContent = template.content || template;
  const cardElement = templateContent.querySelector(".card")?.cloneNode(true);

  if (!cardElement) {
    throw new Error("Card element not found in template");
  }

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__delete-button");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  if (!cardImage || !cardTitle || !likeButton || !likeCount) {
    throw new Error("Required card elements are missing");
  }

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name || "";
  cardTitle.textContent = cardData.name || "";
  likeCount.textContent = cardData.likes?.length || 0;

  cardElement.dataset.cardId = cardData._id;

  if (deleteButton) {
    if (cardData.owner?._id !== userId) {
      deleteButton.style.display = "none";
    } else {
      deleteButton.addEventListener("click", (evt) => {
        evt.stopPropagation();
        handleDeleteClick(cardElement);
      });
    }
  }

  const isLiked = cardData.likes?.some((like) => like._id === userId) || false;
  likeButton.classList.toggle("card__like-button_is-active", isLiked);

  likeButton.addEventListener("click", (evt) => {
    evt.stopPropagation();
    handleLikeClick(cardElement);
  });

  cardImage.addEventListener("click", () => {
    handleImageClick(cardElement);
  });

  return cardElement;
}
