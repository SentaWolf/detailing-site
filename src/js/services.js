import { gsap } from "gsap";

export function initServicesCatalog() {
  const servicesBlock = document.querySelector(".services");
  if (!servicesBlock) return;

  const track = servicesBlock.querySelector(".services__track");
  const tabsContainer = servicesBlock.querySelector(".services__tabs");
  const prevBtn = servicesBlock.querySelector(".services__arrow-btn.prev");
  const nextBtn = servicesBlock.querySelector(".services__arrow-btn.next");

  const allCards = Array.from(
    servicesBlock.querySelectorAll(".services__card"),
  );
  if (allCards.length === 0) return;

  const FIXED_CARD_WIDTH = 280;
  const FIXED_GAP = 24;
  const SWIPE_THRESHOLD = 40;

  let currentIndex = 0;
  let currentFilter = "all";
  let activeServicesTween = null;
  let filteredCards = [...allCards];

  let isTrackDragging = false;
  let trackStartX = 0;
  let trackMovedX = 0;

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

    const cardWidth = window.innerHeight <= 576 ? 464 : 280;
    const stepWidth = cardWidth + FIXED_GAP;
    const targetX = targetIndex * stepWidth;

    activeServicesTween = gsap.to(track, {
      x: -targetX,
      duration: 0.8,
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

  // 4.ОКНО ПОП-АПА
  // =======================================================
  const popup = document.getElementById("servicesPopup");
  const popupImage = document.getElementById("popupServicesImage");
  const popupPrice = document.getElementById("popupServicesPrice");
  const popupTitle = document.getElementById("popupServicesTitle");
  const popupText = document.getElementById("popupServicesText");

  const popupCloseBtn = popup
    ? popup.querySelector(".services-popup__close")
    : null;
  const popupOverlay = popup
    ? popup.querySelector(".services-popup__overlay")
    : null;

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
    tabsContainer.addEventListener("click", (e) => {
      const tabBtn = e.target.closest(".services__tab-btn");
      if (!tabBtn || tabBtn.classList.contains("is-active")) return;

      tabsContainer
        .querySelectorAll(".services__tab-btn")
        .forEach((btn) => btn.classList.remove("is-active"));
      tabBtn.classList.add("is-active");

      const filterValue = tabBtn.getAttribute("data-filter");
      filterCategory(filterValue);
    });
  }

  function startTrackDrag(clientX) {
    isTrackDragging = true;
    trackStartX = clientX;
    trackMovedX = 0;
  }

  function moveTrackDrag(clientX) {
    if (!isTrackDragging) return;
    trackMovedX = clientX - trackStartX;
    const cardWidth = window.innerHeight <= 576 ? 464 : 280;
    const currentStepWidth = cardWidth + FIXED_GAP;
    const baseTranslateX = -(currentIndex * currentStepWidth);
    gsap.set(track, { x: baseTranslateX + trackMovedX * 0.4 });
  }

  function endTrackDrag() {
    if (!isTrackDragging) return;
    isTrackDragging = false;

    if (trackMovedX < -SWIPE_THRESHOLD) {
      moveNext();
    } else if (trackMovedX > SWIPE_THRESHOLD) {
      movePrev();
    } else {
      goToCard(currentIndex);
    }
  }

  track.addEventListener("mousedown", (e) => {
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

export function initServicesEqualizer() {
  const container = document.getElementById("servicesEqualizerAmbient");
  const track = document.getElementById("servicesEqualizerTrack");
  if (!container || !track) return;

  const RAY_WIDTH = 32;

  const rayTemplate = [
    { height: 80, type: "services-equalizer-ray--cream" },
    { height: 70, type: "services-equalizer-ray--light-blue" },
    { height: 60, type: "services-equalizer-ray--light-green" },
    { height: 50, type: "services-equalizer-ray--dark-green" },
    { height: 40, type: "services-equalizer-ray--dark-blue" },
    { height: 40, type: "services-equalizer-ray--dark-blue" },
    { height: 50, type: "services-equalizer-ray--dark-green" },
    { height: 60, type: "services-equalizer-ray--light-green" },
    { height: 70, type: "services-equalizer-ray--light-blue" },
    { height: 80, type: "services-equalizer-ray--cream" },
  ];

  function generateEqualizer() {
    track.innerHTML = "";

    const totalRaysNeeded = Math.ceil(window.innerWidth / RAY_WIDTH);

    for (let i = 0; i < totalRaysNeeded; i++) {
      const ray = document.createElement("div");
      const config = rayTemplate[i % rayTemplate.length];

      ray.className = `services-equalizer-ray ${config.type}`;
      ray.style.height = `${config.height}px`;
      const colorName = config.type.replace("services-equalizer-ray--", "");
      ray.dataset.colorName = colorName;

      track.appendChild(ray);
    }

    animateEqualizerWave();
  }

  function animateEqualizerWave() {
    const allRays = track.querySelectorAll(".services-equalizer-ray");
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
