import { gsap } from "gsap";

export function initReviewsEqualizer() {
  const container = document.getElementById("reviewsEqualizerAmbient");
  const track = document.getElementById("reviewsEqualizerTrack");
  if (!container || !track) return;

  const RAY_WIDTH = 32;

  const rayTemplate = [
    { height: 40, type: "reviews-equalizer-ray--dark-blue" },
    { height: 50, type: "reviews-equalizer-ray--dark-green" },
    { height: 60, type: "reviews-equalizer-ray--light-green" },
    { height: 70, type: "reviews-equalizer-ray--light-blue" },
    { height: 80, type: "reviews-equalizer-ray--cream" },
    { height: 80, type: "reviews-equalizer-ray--cream" },
    { height: 70, type: "reviews-equalizer-ray--light-blue" },
    { height: 60, type: "reviews-equalizer-ray--light-green" },
    { height: 50, type: "reviews-equalizer-ray--dark-green" },
    { height: 40, type: "reviews-equalizer-ray--dark-blue" },
  ];

  function generateEqualizer() {
    track.innerHTML = "";

    const totalRaysNeeded = Math.ceil(window.innerWidth / RAY_WIDTH);

    for (let i = 0; i < totalRaysNeeded; i++) {
      const ray = document.createElement("div");
      const config = rayTemplate[i % rayTemplate.length];

      ray.className = `reviews-equalizer-ray ${config.type}`;
      ray.style.height = `${config.height}px`;
      const colorName = config.type.replace("reviews-equalizer-ray--", "");
      ray.dataset.colorName = colorName;

      track.appendChild(ray);
    }

    animateEqualizerWave();
  }

  function animateEqualizerWave() {
    const allRays = track.querySelectorAll(".reviews-equalizer-ray");
    if (allRays.length === 0) return;

    const colorMap = {
      cream: {
        active: "rgba(255, 234, 197, 0.5)",
        normal: "rgba(255, 234, 197, 0.2)",
      },
      "light-blue": {
        active: "rgba(226, 232, 240, 0.5)",
        normal: "rgba(226, 232, 240, 0.2)",
      },
      "light-green": {
        active: "rgba(160, 177, 150, 0.5)",
        normal: "rgba(160, 177, 150, 0.2)",
      },
      "dark-green": {
        active: "rgba(104, 112, 105, 0.5)",
        normal: "rgba(104, 112, 105, 0.2)",
      },
      "dark-blue": {
        active: "rgba(160, 174, 192, 0.5)",
        normal: "rgba(160, 174, 192, 0.2)",
      },
    };

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(allRays, {
      duration: 0.15,
      stagger: {
        each: 0.08,
        yoyo: true,
        repeat: 1,
      },
      backgroundColor: (index, target) => {
        const color = target.dataset.colorName;
        return colorMap[color]
          ? colorMap[color].active
          : "rgba(255,255,255,0.5)";
      },
    });
  }

  generateEqualizer();

  window.addEventListener("resize", () => {
    if (window.equalizerTimeout) clearTimeout(window.equalizerEqualizerTimeout);
    window.equalizerTimeout = setTimeout(generateEqualizer, 200);
  });
}

export function initReviewsSlider() {
  const reviewsBlock = document.querySelector(".reviews");
  if (!reviewsBlock) return;

  const track = reviewsBlock.querySelector(".reviews__track");
  const prevBtn = reviewsBlock.querySelector(".reviews__arrow-btn.prev");
  const nextBtn = reviewsBlock.querySelector(".reviews__arrow-btn.next");

  const allCards = Array.from(reviewsBlock.querySelectorAll(".reviews__card"));
  if (allCards.length === 0) return;

  const FIXED_CARD_WIDTH = 376;
  const FIXED_GAP = 24;
  const SWIPE_THRESHOLD = 40;

  let currentIndex = 0;
  let activeReviewsTween = null;

  let isTrackDragging = false;
  let trackStartX = 0;
  let trackMovedX = 0;

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

    const currentCardWidth = window.innerWidth < 768 ? 288 : 376;
    const stepWidth = currentCardWidth + FIXED_GAP;
    const targetX = targetIndex * stepWidth;

    activeReviewsTween = gsap.to(track, {
      x: -targetX,
      duration: 0.8,
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

  //////////////////////////////////////////////////////
  const popup = document.getElementById("reviewsPopup");
  const popupAuthor = document.getElementById("popupReviewsAuthor");
  const popupStarsContainer = popup
    ? popup.querySelector(".reviews-popup__stars")
    : null;
  const popupDate = document.getElementById("popupReviewsDate");
  const popupText = document.getElementById("popupReviewsText");

  const popupCloseBtn = popup
    ? popup.querySelector(".reviews-popup__close")
    : null;
  const popupOverlay = popup
    ? popup.querySelector(".reviews-popup__overlay")
    : null;

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
  ////////////////////////////////////////////////////////////

  function startTrackDrag(clientX) {
    isTrackDragging = true;
    trackStartX = clientX;
    trackMovedX = 0;
  }

  function moveTrackDrag(clientX) {
    if (!isTrackDragging) return;
    trackMovedX = clientX - trackStartX;

    const currentCardWidth = window.innerWidth < 768 ? 288 : 376;
    const currentStepWidth = currentCardWidth + FIXED_GAP;

    const baseTranslateX = -(currentIndex * currentStepWidth);
    gsap.set(track, { x: baseTranslateX + trackMovedX * 0.4 });
  }

  function endTrackDrag() {
    if (!isTrackDragging) return;
    isTrackDragging = false;

    // Если сдвинули сильнее порога — перелистываем пачку, иначе — возвращаем на место
    if (trackMovedX < -SWIPE_THRESHOLD) {
      moveNext();
    } else if (trackMovedX > SWIPE_THRESHOLD) {
      movePrev();
    } else {
      goToCard(currentIndex);
    }
  }

  track.addEventListener("mousedown", (e) => {
    // Игнорируем запуск драга, если кликнули по интерактивной кнопке внутри отзыва
    if (e.target.closest("button") || e.target.closest("a")) return;
    e.preventDefault();
    startTrackDrag(e.clientX);
  });
  window.addEventListener("mousemove", (e) => moveTrackDrag(e.clientX));
  window.addEventListener("mouseup", endTrackDrag);

  track.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches[0]) startTrackDrag(e.touches[0].clientX);
    },
    { passive: true },
  );
  track.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) moveTrackDrag(e.touches[0].clientX);
    },
    { passive: true },
  );
  track.addEventListener("touchend", endTrackDrag);

  function checkReviewsButtonsVisibility() {
    allCards.forEach((card) => {
      const textEl = card.querySelector(".reviews__card-text");
      const btnEl = card.querySelector(".reviews__card-more-btn");
      if (!textEl || !btnEl) return;

      btnEl.style.display = "none";

      const isMobileWidth = window.innerWidth < 768;
      const maxAllowedHeight = isMobileWidth ? 270 : 164;

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
