import { gsap } from "gsap";

export function initGallerySlider() {
  const galleryBlock = document.querySelector(".gallery");
  if (!galleryBlock) return;

  const track = galleryBlock.querySelector(".gallery__track");
  const prevBtn = galleryBlock.querySelector(".gallery__arrow-btn.prev");
  const nextBtn = galleryBlock.querySelector(".gallery__arrow-btn.next");
  if (!track) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  const ANIM_DURATION = isMobile ? 0.5 : 0.8;
  const SWIPE_THRESHOLD = isMobile ? 80 : 50;

  let currentPosition = 0;
  const leftEndPoint = 0;
  let activeGalleryTween = null;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startTranslateX = 0;
  let dragX = 0;
  let dragY = 0;

  function getPixelStep() {
    const width = window.innerWidth;
    if (width > 1232) return 1200;
    if (width > 832) return 800;
    if (width > 432) return 400;
    return 288;
  }

  function getRightEndPoint() {
    return -(track.scrollWidth - getPixelStep());
  }

  function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;

    const rightEndPoint = getRightEndPoint();
    const currentRounded = Math.round(currentPosition);
    const rightRounded = Math.round(rightEndPoint);

    if (currentRounded >= leftEndPoint) {
      prevBtn.classList.add("is-disabled");
    } else {
      prevBtn.classList.remove("is-disabled");
    }

    if (currentRounded <= rightRounded) {
      nextBtn.classList.add("is-disabled");
    } else {
      nextBtn.classList.remove("is-disabled");
    }
  }

  function moveTrack(targetPosition) {
    if (activeGalleryTween) activeGalleryTween.kill();

    const rightEndPoint = getRightEndPoint();

    currentPosition = Math.min(
      leftEndPoint,
      Math.max(rightEndPoint, targetPosition),
    );

    updateNavButtons();

    activeGalleryTween = gsap.to(track, {
      force3D: false,
      transform: `translateX(${currentPosition}px)`,
      duration: ANIM_DURATION,
      ease: "expo.out",
      onComplete: () => {
        activeGalleryTween = null;
      },
    });
  }

  const navContainer = galleryBlock.querySelector(".gallery__nav");
  if (navContainer) {
    navContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".gallery__arrow-btn");
      if (!btn || btn.classList.contains("is-disabled")) return;

      const step = getPixelStep();

      if (btn.classList.contains("next")) {
        moveTrack(currentPosition - step);
      }
      if (btn.classList.contains("prev")) {
        moveTrack(currentPosition + step);
      }
    });
  }

  function startDrag(clientX, clientY) {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    startTranslateX = currentPosition;
    dragX = 0;
    dragY = 0;

    if (activeGalleryTween) activeGalleryTween.kill();
  }

  function moveDrag(clientX, clientY) {
    if (!isDragging) return;
    dragX = clientX - startX;
    dragY = clientY - startY;

    // Если свайп больше вертикальный — не мешаем скроллу
    if (Math.abs(dragY) > Math.abs(dragX) * 1.5) {
      return;
    }

    const rightEndPoint = getRightEndPoint();
    let tempPosition = startTranslateX + dragX * 0.6;
    tempPosition = Math.min(
      leftEndPoint,
      Math.max(rightEndPoint, tempPosition),
    );

    gsap.set(track, { transform: `translateX(${tempPosition}px)` });
    track.style.cursor = "grabbing";
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "";

    const step = getPixelStep();
    const isTap = Math.abs(dragX) < 10;

    if (isTap) return;

    if (dragX < -SWIPE_THRESHOLD) {
      moveTrack(startTranslateX - step);
    } else if (dragX > SWIPE_THRESHOLD) {
      moveTrack(startTranslateX + step);
    } else {
      moveTrack(startTranslateX);
    }
  }

  track.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("a")) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener("mouseup", endDrag);

  track.addEventListener(
    "touchstart",
    (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      if (e.touches && e.touches[0]) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging || !e.touches || !e.touches[0]) return;

      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);

      // Если свайп вертикальный — не блокируем скролл страницы
      if (dy > dx) return;

      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false },
  );

  track.addEventListener("touchend", endDrag);
  updateNavButtons();

  window.addEventListener("resize", () => {
    moveTrack(currentPosition);
  });

  // ПОП-АП
  // =======================================================
  const popup = document.getElementById("galleryPopup");
  const popupImage = document.getElementById("popupGalleryImage");
  const popupText = document.getElementById("popupGalleryText");

  const popupCloseBtn = popup ? popup.querySelector(".popup__close") : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  let lastActiveGalleryElement = null;

  function openGalleryPopup(cardElement) {
    if (!popup || !popupImage || !popupText) return;

    const cardImg = cardElement.querySelector(".gallery__img");
    const captionText = cardElement.getAttribute("data-caption");

    if (cardImg) {
      popupImage.src = cardImg.src;
      popupImage.alt = cardImg.alt || "Фото выполненной работы";
      popupImage.setAttribute("aria-hidden", "false");
    }

    if (captionText && captionText.trim() !== "") {
      popupText.textContent = captionText;
      popupText.style.display = "";
    } else {
      popupText.textContent = "";
      popupText.style.display = "none";
    }

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");

    if (popupCloseBtn) popupCloseBtn.focus();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeGalleryPopup() {
    if (!popup) return;

    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    if (popupImage) popupImage.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    if (
      lastActiveGalleryElement &&
      typeof lastActiveGalleryElement.focus === "function"
    ) {
      lastActiveGalleryElement.focus();
    }
  }

  function handleCardActivation(clickedCard) {
    if (!clickedCard) return;
    lastActiveGalleryElement = clickedCard;
    openGalleryPopup(clickedCard);
  }

  track.addEventListener("click", (e) => {
    const clickedCard = e.target.closest(".gallery__card");
    handleCardActivation(clickedCard);
  });

  track.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const clickedCard = e.target.closest(".gallery__card");
      if (clickedCard) {
        e.preventDefault();
        handleCardActivation(clickedCard);
      }
    }
  });

  if (popupCloseBtn) popupCloseBtn.addEventListener("click", closeGalleryPopup);
  if (popupOverlay) popupOverlay.addEventListener("click", closeGalleryPopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closeGalleryPopup();
    }
  });
}
