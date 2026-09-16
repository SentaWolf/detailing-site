import { gsap } from "gsap";

export function initReviewsSlider() {
  const reviewsBlock = document.querySelector(".reviews");
  if (!reviewsBlock) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  const ANIM_DURATION = isMobile ? 0.5 : 0.8;
  const SWIPE_THRESHOLD = isMobile ? 70 : 40;

  const track = reviewsBlock.querySelector(".reviews__track");
  const prevBtn = reviewsBlock.querySelector(".reviews__arrow-btn.prev");
  const nextBtn = reviewsBlock.querySelector(".reviews__arrow-btn.next");

  const allCards = Array.from(reviewsBlock.querySelectorAll(".reviews__card"));
  if (allCards.length === 0) return;

  const FIXED_GAP = 24;
  const CARD_WIDTH_DESKTOP = 376;
  const CARD_WIDTH_MOBILE = 288;
  const MAX_TEXT_HEIGHT_DESKTOP = 164;
  const MAX_TEXT_HEIGHT_MOBILE = 270;

  function getCurrentCardWidth() {
    return window.innerWidth < 768 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  }

  let currentIndex = 0;
  let activeReviewsTween = null;

  let isTrackDragging = false;
  let trackStartX = 0;
  let trackStartY = 0;
  let trackMovedX = 0;
  let trackMovedY = 0;

  function getStepCardsCount() {
    const width = window.innerWidth;
    if (width > 1176) return 3;
    if (width > 776) return 2;
    return 1;
  }

  function getVisibleCardsCount() {
    const width = window.innerWidth;
    if (width > 1176) return 3;
    if (width > 776) return 2;
    return 1;
  }

  function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;

    const visibleCount = getVisibleCardsCount();

    if (currentIndex === 0) {
      prevBtn.classList.add("is-disabled");
    } else {
      prevBtn.classList.remove("is-disabled");
    }

    if (currentIndex + visibleCount >= allCards.length) {
      nextBtn.classList.add("is-disabled");
    } else {
      nextBtn.classList.remove("is-disabled");
    }
  }

  function goToCard(index) {
    const visibleCount = getVisibleCardsCount();
    const maxIndex = Math.max(0, allCards.length - visibleCount);
    let targetIndex = Math.max(0, Math.min(index, maxIndex));

    if (activeReviewsTween && activeReviewsTween.isActive()) {
      activeReviewsTween.progress(1).kill();
    }

    currentIndex = targetIndex;
    updateNavButtons();

    const stepWidth = getCurrentCardWidth() + FIXED_GAP;
    const targetX = targetIndex * stepWidth;

    activeReviewsTween = gsap.to(track, {
      x: -targetX,
      duration: ANIM_DURATION,
      ease: "expo.out",
      onComplete: () => {
        activeReviewsTween = null;
      },
    });
  }

  function moveNext() {
    const stepCount = getStepCardsCount();
    goToCard(currentIndex + stepCount);
  }

  function movePrev() {
    const stepCount = getStepCardsCount();
    goToCard(currentIndex - stepCount);
  }

  if (reviewsBlock.querySelector(".reviews__nav")) {
    reviewsBlock
      .querySelector(".reviews__nav")
      .addEventListener("click", (e) => {
        const btn = e.target.closest(".reviews__arrow-btn");
        if (!btn || btn.classList.contains("is-disabled")) return;

        if (btn.classList.contains("next")) moveNext();
        if (btn.classList.contains("prev")) movePrev();
      });
  }

  // === ПОП-АП ===
  const popup = document.getElementById("reviewsPopup");
  const popupAuthor = document.getElementById("popupReviewsAuthor");
  const popupStarsContainer = popup
    ? popup.querySelector(".reviews-popup__stars")
    : null;
  const popupDate = document.getElementById("popupReviewsDate");
  const popupText = document.getElementById("popupReviewsText");

  const popupCloseBtn = popup
    ? popup.querySelector(".popup__close") || popup.querySelector("button")
    : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  let lastActiveReviewsElement = null;

  function openReviewsPopup(cardElement) {
    if (
      !popup ||
      !popupAuthor ||
      !popupStarsContainer ||
      !popupDate ||
      !popupText
    )
      return;

    const cardAuthor = cardElement.querySelector(".reviews__card-name");
    const cardStars = cardElement.querySelector(".reviews__card-stars");
    const cardDate = cardElement.querySelector(".reviews__card-date");
    const cardText = cardElement.querySelector(".reviews__card-text");

    if (cardAuthor) popupAuthor.textContent = cardAuthor.textContent;

    if (cardDate) {
      popupDate.textContent = cardDate.textContent;

      const rawDatetime = cardDate.getAttribute("datetime");
      popupDate.setAttribute(
        "datetime",
        rawDatetime ? rawDatetime : "2026-09-04",
      );
    }

    if (cardText) popupText.textContent = cardText.textContent;

    if (cardStars) {
      popupStarsContainer.innerHTML = cardStars.innerHTML;

      const rawAriaLabel = cardStars.getAttribute("aria-label");
      popupStarsContainer.setAttribute(
        "aria-label",
        rawAriaLabel ? rawAriaLabel : "Рейтинг: 5 звёзд из 5 звёзд",
      );
    }

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");

    if (popupCloseBtn) popupCloseBtn.focus();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeReviewsPopup() {
    if (!popup) return;

    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    if (
      lastActiveReviewsElement &&
      typeof lastActiveReviewsElement.focus === "function"
    ) {
      lastActiveReviewsElement.focus();
    }
  }

  track.addEventListener("click", (e) => {
    const moreBtn = e.target.closest(".reviews__card-more-btn");
    if (!moreBtn) return;

    const parentCard = moreBtn.closest(".reviews__card");
    if (!parentCard) return;

    lastActiveReviewsElement = moreBtn;
    openReviewsPopup(parentCard);
  });

  if (popupCloseBtn) popupCloseBtn.addEventListener("click", closeReviewsPopup);
  if (popupOverlay) popupOverlay.addEventListener("click", closeReviewsPopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closeReviewsPopup();
    }
  });

  // === СВАЙПЫ ===
  function startTrackDrag(clientX, clientY) {
    isTrackDragging = true;
    trackStartX = clientX;
    trackStartY = clientY;
    trackMovedX = 0;
    trackMovedY = 0;
  }

  function moveTrackDrag(clientX, clientY) {
    if (!isTrackDragging) return;
    trackMovedX = clientX - trackStartX;
    trackMovedY = clientY - trackStartY;

    const currentStepWidth = getCurrentCardWidth() + FIXED_GAP;
    const baseTranslateX = -(currentIndex * currentStepWidth);
    gsap.set(track, { x: baseTranslateX + trackMovedX * 0.4 });
  }

  function endTrackDrag() {
    if (!isTrackDragging) return;
    isTrackDragging = false;

    const deltaX = Math.abs(trackMovedX);
    const deltaY = Math.abs(trackMovedY);

    if (deltaY > deltaX) return;
    if (deltaX < SWIPE_THRESHOLD) {
      goToCard(currentIndex);
      return;
    }

    if (trackMovedX < 0) {
      moveNext();
    } else {
      movePrev();
    }
  }

  track.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    e.preventDefault();
    startTrackDrag(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) =>
    moveTrackDrag(e.clientX, e.clientY),
  );
  window.addEventListener("mouseup", endTrackDrag);

  track.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches[0]) {
        startTrackDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isTrackDragging || !e.touches || !e.touches[0]) return;

      const dx = Math.abs(e.touches[0].clientX - trackStartX);
      const dy = Math.abs(e.touches[0].clientY - trackStartY);

      // Если свайп больше вертикальный — не блокируем скролл страницы
      if (dy > dx) return;

      e.preventDefault();
      moveTrackDrag(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false },
  );

  track.addEventListener("touchend", endTrackDrag);

  function checkReviewsButtonsVisibility() {
    allCards.forEach((card) => {
      const textEl = card.querySelector(".reviews__card-text");
      const btnEl = card.querySelector(".reviews__card-more-btn");
      if (!textEl || !btnEl) return;

      btnEl.style.display = "none";

      const isMobileWidth = window.innerWidth < 768;
      const maxAllowedHeight = isMobileWidth
        ? MAX_TEXT_HEIGHT_MOBILE
        : MAX_TEXT_HEIGHT_DESKTOP;

      if (textEl.scrollHeight > maxAllowedHeight) {
        btnEl.style.display = "block";
      }
    });
  }

  checkReviewsButtonsVisibility();
  updateNavButtons();

  if (window.ResizeObserver) {
    const reviewsObserver = new ResizeObserver(() => {
      goToCard(currentIndex);
    });
    reviewsObserver.observe(reviewsBlock);
  }
}
