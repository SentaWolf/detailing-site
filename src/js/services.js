import { gsap } from "gsap";

export function initServicesCatalog() {
  const servicesBlock = document.querySelector(".services");
  if (!servicesBlock) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  const ANIM_DURATION = isMobile ? 0.5 : 0.8;
  const SWIPE_THRESHOLD = isMobile ? 80 : 40;

  const track = servicesBlock.querySelector(".services__track");
  const tabsContainer = servicesBlock.querySelector(".services__tabs");
  const prevBtn = servicesBlock.querySelector(".services__arrow-btn.prev");
  const nextBtn = servicesBlock.querySelector(".services__arrow-btn.next");

  const allCards = Array.from(
    servicesBlock.querySelectorAll(".services__card"),
  );
  if (allCards.length === 0) return;

  const FIXED_GAP = 24;

  let currentIndex = 0;
  let currentFilter = "all";
  let activeServicesTween = null;
  let filteredCards = [...allCards];

  let isTrackDragging = false;
  let trackStartX = 0;
  let trackStartY = 0;
  let trackMovedX = 0;
  let trackMovedY = 0;

  function getStepCardsCount() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (height <= 576) return 1;
    if (width > 1200) return 4;
    if (width > 992) return 3;
    if (width > 768) return 2;
    return 1;
  }

  function getVisibleCardsCount() {
    const width = window.innerWidth;
    if (width > 1200) return 4;
    if (width > 992) return 3;
    if (width > 768) return 2;
    return 1;
  }

  function getCardWidth() {
    return window.innerHeight <= 576 ? 464 : 280;
  }

  function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;

    const visibleCount = getVisibleCardsCount();

    if (currentIndex === 0) {
      prevBtn.classList.add("is-disabled");
    } else {
      prevBtn.classList.remove("is-disabled");
    }

    if (currentIndex + visibleCount >= filteredCards.length) {
      nextBtn.classList.add("is-disabled");
    } else {
      nextBtn.classList.remove("is-disabled");
    }
  }

  function goToCard(index) {
    const visibleCount = getVisibleCardsCount();
    const maxIndex = Math.max(0, filteredCards.length - visibleCount);
    let targetIndex = Math.max(0, Math.min(index, maxIndex));

    if (activeServicesTween && activeServicesTween.isActive()) {
      activeServicesTween.progress(1).kill();
    }

    currentIndex = targetIndex;
    updateNavButtons();

    const stepWidth = getCardWidth() + FIXED_GAP;
    const targetX = targetIndex * stepWidth;

    activeServicesTween = gsap.to(track, {
      x: -targetX,
      duration: ANIM_DURATION,
      ease: "expo.out",
      onComplete: () => {
        activeServicesTween = null;
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

  if (servicesBlock.querySelector(".services__nav")) {
    servicesBlock
      .querySelector(".services__nav")
      .addEventListener("click", (e) => {
        const btn = e.target.closest(".services__arrow-btn");
        if (!btn || btn.classList.contains("is-disabled")) return;

        if (btn.classList.contains("next")) moveNext();
        if (btn.classList.contains("prev")) movePrev();
      });
  }

  // === ПОП-АП ===
  const popup = document.getElementById("servicesPopup");
  const popupImage = document.getElementById("popupServicesImage");
  const popupPrice = document.getElementById("popupServicesPrice");
  const popupTitle = document.getElementById("popupServicesTitle");
  const popupText = document.getElementById("popupServicesText");

  const popupCloseBtn = popup
    ? popup.querySelector(".popup__close") || popup.querySelector("button")
    : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  let lastActiveServicesElement = null;

  function openServicesCatalogPopup(cardElement) {
    if (!popup || !popupImage || !popupPrice || !popupTitle || !popupText)
      return;

    const cardImg = cardElement.querySelector(".services__card-image");
    const cardPrice = cardElement.querySelector(".services__card-price");
    const cardTitle = cardElement.querySelector(".services__card-title");
    const cardText = cardElement.querySelector(".services__card-text");

    if (cardImg) {
      popupImage.src = cardImg.src;
      popupImage.alt = cardImg.alt || "Услуга детейлинга";
      popupImage.setAttribute("aria-hidden", "false");
    }
    if (cardPrice) popupPrice.textContent = cardPrice.textContent;
    if (cardTitle) popupTitle.textContent = cardTitle.textContent;
    if (cardText) popupText.textContent = cardText.textContent;

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");

    if (popupCloseBtn) popupCloseBtn.focus();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeServicesCatalogPopup() {
    if (!popup) return;

    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (popupImage) popupImage.setAttribute("aria-hidden", "true");

    if (
      lastActiveServicesElement &&
      typeof lastActiveServicesElement.focus === "function"
    ) {
      lastActiveServicesElement.focus();
    }
  }

  track.addEventListener("click", (e) => {
    const moreBtn = e.target.closest(".services__card-more-btn");
    if (!moreBtn) return;

    const parentCard = moreBtn.closest(".services__card");
    if (!parentCard) return;

    lastActiveServicesElement = moreBtn;
    openServicesCatalogPopup(parentCard);
  });

  if (popupCloseBtn)
    popupCloseBtn.addEventListener("click", closeServicesCatalogPopup);
  if (popupOverlay)
    popupOverlay.addEventListener("click", closeServicesCatalogPopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closeServicesCatalogPopup();
    }
  });

  // === ФИЛЬТРЫ ===
  function filterCategory(filterValue) {
    currentFilter = filterValue;
    currentIndex = 0;

    if (activeServicesTween && activeServicesTween.isActive()) {
      activeServicesTween.progress(1).kill();
    }

    gsap.to(track, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        allCards.forEach((card) => {
          if (filterValue === "all" || card.dataset.category === filterValue) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });

        filteredCards = allCards.filter(
          (card) => card.style.display !== "none",
        );
        gsap.set(track, { x: 0 });
        gsap.to(track, { opacity: 1, duration: 0.4, ease: "power2.out" });

        updateNavButtons();
      },
    });
  }

  if (tabsContainer) {
    const servicesPanel = document.getElementById("servicesPanel");

    tabsContainer.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".services__tab-btn");
      if (!tabBtn || tabBtn.classList.contains("is-active")) return;

      tabsContainer.querySelectorAll(".services__tab-btn").forEach((btn) => {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-selected", "false");
      });

      tabBtn.classList.add("is-active");
      tabBtn.setAttribute("aria-selected", "true");

      if (servicesPanel) {
        const activeTabId = tabBtn.getAttribute("id");
        servicesPanel.setAttribute("aria-labelledby", activeTabId);
      }

      const filterValue = tabBtn.getAttribute("data-filter");
      filterCategory(filterValue);
    });
  }

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

    const currentStepWidth = getCardWidth() + FIXED_GAP;
    const baseTranslateX = -(currentIndex * currentStepWidth);
    gsap.set(track, { x: baseTranslateX + trackMovedX * 0.4 });
  }

  function endTrackDrag() {
    if (!isTrackDragging) return;
    isTrackDragging = false;

    const deltaX = Math.abs(trackMovedX);
    const deltaY = Math.abs(trackMovedY);

    if (deltaY > deltaX) return; // вертикальный скролл — не листаем
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

  // === ТАБЫ (горизонтальный скролл + drag) ===
  if (tabsContainer) {
    tabsContainer.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        tabsContainer.scrollLeft += e.deltaY * 1.5;
      },
      { passive: false },
    );

    let isTabsDown = false;
    let tabsStartX;
    let tabsScrollLeft;

    tabsContainer.addEventListener("mousedown", (e) => {
      isTabsDown = true;
      tabsContainer.classList.add("is-grabbing");
      tabsStartX = e.pageX - tabsContainer.offsetLeft;
      tabsScrollLeft = tabsContainer.scrollLeft;
    });

    tabsContainer.addEventListener("mouseleave", () => {
      isTabsDown = false;
      tabsContainer.classList.remove("is-grabbing");
    });

    tabsContainer.addEventListener("mouseup", () => {
      isTabsDown = false;
      tabsContainer.classList.remove("is-grabbing");
    });

    tabsContainer.addEventListener("mousemove", (e) => {
      if (!isTabsDown) return;
      e.preventDefault();
      const x = e.pageX - tabsContainer.offsetLeft;

      const walk = (x - tabsStartX) * 2;
      tabsContainer.scrollLeft = tabsScrollLeft - walk;
    });
  }

  updateNavButtons();

  if (window.ResizeObserver) {
    const servicesObserver = new ResizeObserver(() => {
      goToCard(currentIndex);
    });
    servicesObserver.observe(servicesBlock);
  }
}
