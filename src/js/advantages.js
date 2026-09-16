import { gsap } from "gsap";

export function initTextCarousel() {
  const slides = document.querySelectorAll(".card-small__slide");
  if (!slides.length) return;

  let slidesArray = Array.from(slides);

  const ALL_CAROUSEL_CLASSES = [
    "is-top",
    "is-top-animate",
    "is-top-reset",
    "is-under",
    "is-rising",
    "is-rising-animate",
    "is-hidden",
  ];

  function applyClasses() {
    slidesArray.forEach((slide, index) => {
      slide.classList.remove(...ALL_CAROUSEL_CLASSES);

      if (index === 0) {
        slide.classList.add("is-top");
      } else if (index === 1) {
        slide.classList.add("is-under");
      } else if (index === 2) {
        slide.classList.add("is-rising");
      } else {
        slide.classList.add("is-hidden");
      }
    });
  }

  function rotateStack() {
    const topSlide = slidesArray[0];
    const risingSlide = slidesArray[2];

    if (topSlide) {
      topSlide.classList.remove("is-top");
      topSlide.classList.add("is-top-animate");
    }

    if (risingSlide) {
      risingSlide.classList.remove("is-rising");
      risingSlide.classList.add("is-rising-animate");
    }

    setTimeout(() => {
      if (topSlide) {
        topSlide.classList.remove("is-top-animate");
        topSlide.classList.add("is-top-reset");
      }

      const shiftedSlide = slidesArray.shift();
      if (shiftedSlide) slidesArray.push(shiftedSlide);

      applyClasses();
    }, 600);
  }

  applyClasses();

  if (slidesArray.length >= 2) {
    setInterval(rotateStack, 6000);
  }
}

export function initAmbientBubbles() {
  const ambientContainer = document.getElementById("advantagesBubblesAmbient");
  if (!ambientContainer) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse), (max-width: 1024px)",
  ).matches;
  if (isMobile) {
    ambientContainer.style.display = "none";
    return;
  }

  const TOTAL_BUBBLES = 30;

  const bubbleTypes = [
    { className: "ambient-bubble--type-1", baseSpeed: 4 },
    { className: "ambient-bubble--type-2", baseSpeed: 8 },
    { className: "ambient-bubble--type-3", baseSpeed: 12 },
    { className: "ambient-bubble--type-4", baseSpeed: 14 },
    { className: "ambient-bubble--type-5", baseSpeed: 16 },
    { className: "ambient-bubble--type-6", baseSpeed: 20 },
    { className: "ambient-bubble--type-7", baseSpeed: 24 },
  ];

  // Флаги видимости и «живости» блока
  let isVisible = true;
  let isRunning = true;

  // Хранилище активных tween'ов, чтобы останавливать/запускать их
  const activeTweens = new Map(); // key: bubble element, value: tween

  function createSingleBubble() {
    // Если блок не виден или остановлен — новые пузырьки не создаём
    if (!isVisible || !isRunning) return;

    const bubble = document.createElement("div");

    const randomType =
      bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)];
    bubble.className = `ambient-bubble ${randomType.className}`;

    ambientContainer.appendChild(bubble);

    const randomTop = Math.random() * 80 + 5;
    const duration = randomType.baseSpeed + Math.random() * 3;

    gsap.set(bubble, {
      x: "-10vw",
      y: `${randomTop}vh`,
    });

    const tween = gsap.to(bubble, {
      x: "110vw",
      duration: duration,
      ease: "none",
      paused: !isVisible, // ← стартуем на паузе, если блок не виден
      onComplete: () => {
        activeTweens.delete(bubble);
        bubble.remove();
        createSingleBubble();
      },
    });

    activeTweens.set(bubble, tween);
  }

  // Стартовый запуск
  for (let i = 0; i < TOTAL_BUBBLES; i++) {
    setTimeout(() => {
      createSingleBubble();
    }, i * 1200);
  }

  // Останавливаем/запускаем по видимости
  const advantagesBlock = document.querySelector(".advantages");
  if (!advantagesBlock) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;

        if (isVisible) {
          // Возобновляем все активные пузырьки
          activeTweens.forEach((tween) => tween.play());
          // Запускаем создание новых
          if (!isRunning) {
            isRunning = true;
            createSingleBubble();
          }
        } else {
          // Ставим на паузу все летящие пузырьки
          activeTweens.forEach((tween) => tween.pause());
        }
      });
    },
    { threshold: 0 },
  );

  observer.observe(advantagesBlock);
}

export function initAdvantagesTextClamp() {
  const cardDescBlock = document.querySelector(".card-desc");
  if (!cardDescBlock) return;

  const descSlides = Array.from(
    cardDescBlock.querySelectorAll(".card-desc__slider"),
  );
  if (!descSlides.length) return;

  const FALLBACK_FONT_SIZE_DESC = 16;
  const FALLBACK_LINE_HEIGHT = 1.3;
  const SUBPIXEL_BUFFER = 2;

  function checkAllDescButtonsVisibility() {
    const baseSlide = descSlides[0];
    if (!baseSlide) return;

    const sampleText = baseSlide.querySelector(".card-desc__text");
    const contentContainer =
      baseSlide.querySelector(".card-desc__content") || baseSlide;
    if (!sampleText || !contentContainer) return;

    sampleText.style.webkitLineClamp = "unset";
    sampleText.style.maxHeight = "unset";

    requestAnimationFrame(() => {
      const cardDescTextHeight = contentContainer.clientHeight;

      const computedTextStyle = window.getComputedStyle(sampleText);
      const fontSize =
        parseFloat(computedTextStyle.fontSize) || FALLBACK_FONT_SIZE_DESC;
      const lineHeightVal = computedTextStyle.lineHeight;
      const parsedLineHeight = parseFloat(lineHeightVal);

      const descTextLineHeight = lineHeightVal.includes("px")
        ? parseFloat(lineHeightVal)
        : fontSize *
          (!isNaN(parsedLineHeight) ? parsedLineHeight : FALLBACK_LINE_HEIGHT);

      const safeHeight = cardDescTextHeight - SUBPIXEL_BUFFER;
      let possibleLines = Math.floor(safeHeight / descTextLineHeight);
      const clampLimitWithBtn = Math.max(1, possibleLines - 1);

      if (possibleLines > 0) {
        cardDescBlock.style.setProperty("--desc-clamp", clampLimitWithBtn);
        cardDescBlock.style.setProperty(
          "--desc-line-height",
          `${descTextLineHeight}px`,
        );
      }

      const allowedTextMaxHeight = clampLimitWithBtn * descTextLineHeight;

      descSlides.forEach((slide) => {
        const textEl = slide.querySelector(".card-desc__text");
        const btnEl = slide.querySelector(".card-desc__btn");
        if (!textEl || !btnEl) return;

        textEl.style.webkitLineClamp = "unset";
        textEl.style.maxHeight = "unset";

        btnEl.style.display = "none";

        if (textEl.scrollHeight > allowedTextMaxHeight) {
          btnEl.style.display = "inline-block";
        }

        textEl.style.webkitLineClamp = "";
        textEl.style.maxHeight = "";
      });
    });
  }

  checkAllDescButtonsVisibility();

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      checkAllDescButtonsVisibility();
    });

    descSlides.forEach((slide) => resizeObserver.observe(slide));
  }

  const orientationQuery = window.matchMedia("(orientation: landscape)");

  function handleOrientationChange() {
    setTimeout(() => {
      checkAllDescButtonsVisibility();
    }, 150);
  }

  if (orientationQuery.addEventListener) {
    orientationQuery.addEventListener("change", handleOrientationChange);
  } else {
    orientationQuery.addListener(handleOrientationChange);
  }
}

export function initAdvantagesSlider() {
  const cardMainBlock = document.querySelector(".card-main");
  const cardDescBlock = document.querySelector(".card-desc");
  if (!cardMainBlock || !cardDescBlock) return;

  const mainSlides = Array.from(
    cardMainBlock.querySelectorAll(".card-main__slide"),
  );
  const descSlides = Array.from(
    cardDescBlock.querySelectorAll(".card-desc__slider"),
  );
  if (mainSlides.length < 2 || descSlides.length < 2) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;

  const FALLBACK_FONT_SIZE_MAIN = 20;
  const FALLBACK_LINE_HEIGHT = 1.3;
  const NAV_FIXED_HEIGHT = 48;
  const SUBPIXEL_BUFFER = 2;
  const SWIPE_THRESHOLD = isMobile ? 80 : 50;
  const TIME_SCALE = isMobile ? 1.8 : 1;

  let currentIndex = 0;
  let activeTimeline = null;
  const showMoreBtn = document.querySelector(".advantages__btn-show-more");
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  function checkAllMainHeadingsTruncation() {
    const baseSlide = mainSlides[0];
    if (!baseSlide) return;

    const sampleHeading = baseSlide.querySelector(".card-main__heading");
    const sampleImage = baseSlide.querySelector(".card-main__image");
    const navEl = cardMainBlock.querySelector(".card-main__nav");
    if (!sampleHeading || !sampleImage) return;

    requestAnimationFrame(() => {
      const slideStyle = window.getComputedStyle(baseSlide);
      const cardPadding =
        parseFloat(slideStyle.paddingTop) ||
        parseFloat(slideStyle.paddingBottom) ||
        16;
      const cardGap =
        parseFloat(slideStyle.rowGap) || parseFloat(slideStyle.gap) || 12;

      const computedTextStyle = window.getComputedStyle(sampleHeading);
      const fontSize =
        parseFloat(computedTextStyle.fontSize) || FALLBACK_FONT_SIZE_MAIN;
      const lineHeightVal = computedTextStyle.lineHeight;
      const parsedLineHeight = parseFloat(lineHeightVal);

      const lineHeight = lineHeightVal.includes("px")
        ? parseFloat(lineHeightVal)
        : fontSize *
          (!isNaN(parsedLineHeight) ? parsedLineHeight : FALLBACK_LINE_HEIGHT);

      const totalCardHeight = baseSlide.clientHeight;
      const imageHeight = sampleImage.clientHeight;

      let isNavHidden = true;
      if (navEl) {
        const navStyle = window.getComputedStyle(navEl);
        if (navStyle.display !== "none" && navStyle.visibility !== "hidden") {
          isNavHidden = false;
        }
      }

      let cardContentHeight = 0;
      let totalTextHeight = 0;

      if (isNavHidden) {
        cardContentHeight = totalCardHeight - cardPadding * 2 - cardGap * 1;
        totalTextHeight = cardContentHeight - imageHeight;
      } else {
        cardContentHeight =
          totalCardHeight - cardPadding * 2 - cardGap * 2 - NAV_FIXED_HEIGHT;
        totalTextHeight = cardContentHeight - imageHeight;
      }

      const safeTextHeight = totalTextHeight - SUBPIXEL_BUFFER;
      const amountOfPossibleLines = Math.floor(safeTextHeight / lineHeight);

      if (amountOfPossibleLines > 0) {
        cardMainBlock.style.setProperty(
          "--heading-clamp",
          amountOfPossibleLines,
        );
        cardMainBlock.style.setProperty(
          "--heading-line-height",
          `${lineHeight}px`,
        );
      }
    });
  }

  function forceCloseMobileDesc() {
    if (cardDescBlock.classList.contains("is-open")) {
      cardDescBlock.classList.remove("is-open");
      if (showMoreBtn) showMoreBtn.classList.remove("is-active");
    }
  }

  function updateStackLayers() {
    mainSlides.forEach((slide, index) => {
      const heading = slide.querySelector(".card-main__heading");
      const image = slide.querySelector(".card-main__image");

      if (index === currentIndex) {
        gsap.set(slide, { zIndex: 5, opacity: 1, visibility: "visible" });
        if (image)
          gsap.set(image, {
            scale: 1,
            webkitMaskImage: "none",
            maskImage: "none",
            "--mask-main": "0%",
          });
        if (heading) gsap.set(heading, { opacity: 1 });
      } else {
        gsap.set(slide, { zIndex: 1, opacity: 0, visibility: "hidden" });
      }
    });

    descSlides.forEach((slide, index) => {
      if (index === currentIndex) {
        gsap.set(slide, {
          zIndex: 5,
          opacity: 1,
          visibility: "visible",
          x: "0%",
        });
      } else {
        gsap.set(slide, { zIndex: 1, opacity: 0, visibility: "hidden" });
      }
    });
  }

  function changeSlide(direction) {
    forceCloseMobileDesc();
    if (activeTimeline && activeTimeline.isActive())
      activeTimeline.progress(1).kill();

    let targetIndex = 0;
    if (direction === "next") {
      targetIndex = (currentIndex + 1) % mainSlides.length;
    } else {
      targetIndex = (currentIndex - 1 + mainSlides.length) % mainSlides.length;
    }

    const currentMain = mainSlides[currentIndex];
    const targetMain = mainSlides[targetIndex];
    const currentDesc = descSlides[currentIndex];
    const targetDesc = descSlides[targetIndex];

    const currentHeading = currentMain.querySelector(".card-main__heading");
    const currentImage = currentMain.querySelector(".card-main__image");
    const targetHeading = targetMain.querySelector(".card-main__heading");
    const targetImage = targetMain.querySelector(".card-main__image");

    gsap.set(targetMain, { zIndex: 4, opacity: 1, visibility: "visible" });
    if (targetHeading) gsap.set(targetHeading, { opacity: 0 });

    if (direction === "next") {
      if (targetImage)
        gsap.set(targetImage, {
          scale: 0.7,
          webkitMaskImage:
            "radial-gradient(circle, black var(--mask-main), transparent calc(var(--mask-main) + 15%))",
          maskImage:
            "radial-gradient(circle, black var(--mask-main), transparent calc(var(--mask-main) + 15%))",
          "--mask-main": "30%",
        });
      if (currentImage)
        gsap.set(currentImage, {
          scale: 1,
          webkitMaskImage:
            "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
          maskImage:
            "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
          "--mask-main": "30%",
        });
      gsap.set(targetDesc, {
        zIndex: 4,
        opacity: 1,
        visibility: "visible",
        x: "0%",
      });
    } else {
      if (targetImage)
        gsap.set(targetImage, {
          scale: 1,
          webkitMaskImage: "none",
          maskImage: "none",
          "--mask-main": "0%",
        });
      if (currentImage)
        gsap.set(currentImage, {
          scale: 1,
          webkitMaskImage:
            "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
          maskImage:
            "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
          "--mask-main": "0%",
        });
      gsap.set(targetDesc, {
        zIndex: 6,
        opacity: 1,
        visibility: "visible",
        x: "100%",
      });
    }

    activeTimeline = gsap.timeline({
      onComplete: () => {
        currentIndex = targetIndex;
        updateStackLayers();
        activeTimeline = null;
      },
    });

    if (isMobile) {
      activeTimeline.timeScale(TIME_SCALE);
    }

    if (currentHeading)
      activeTimeline.to(
        currentHeading,
        { opacity: 0, duration: 0.3, ease: "power2.out" },
        0,
      );
    if (targetHeading)
      activeTimeline.to(
        targetHeading,
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        0.2,
      );

    if (currentImage) {
      activeTimeline.to(
        currentImage,
        {
          "--mask-main": "100%",
          scale: 0.7,
          duration: direction === "next" ? 1 : 0.8,
          ease: "expo.out",
        },
        0,
      );
    }

    if (direction === "next") {
      if (targetImage) {
        activeTimeline.to(
          targetImage,
          { "--mask-main": "100%", scale: 1, duration: 1, ease: "expo.out" },
          0,
        );
      }
      activeTimeline.to(
        currentDesc,
        { x: "100%", duration: 1, ease: "expo.out" },
        0,
      );
    } else {
      activeTimeline.to(
        targetDesc,
        { x: "0%", duration: 0.8, ease: "expo.out" },
        0,
      );
    }
  }

  function moveNext() {
    changeSlide("next");
  }

  function movePrev() {
    changeSlide("prev");
  }

  cardMainBlock.addEventListener("click", (e) => {
    if (e.target.classList.contains("next")) moveNext();
    if (e.target.classList.contains("prev")) movePrev();
  });

  [cardMainBlock, cardDescBlock].forEach((block) => {
    block.addEventListener(
      "touchstart",
      (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }
      },
      { passive: true },
    );

    block.addEventListener(
      "touchend",
      (e) => {
        if (!e.changedTouches || !e.changedTouches[0]) return;

        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        const deltaX = Math.abs(touchStartX - touchEndX);
        const deltaY = Math.abs(touchStartY - touchEndY);

        // Если свайп больше вертикальный — не переключаем слайд
        if (deltaY > deltaX) return;

        if (deltaX < SWIPE_THRESHOLD) return;

        if (touchStartX - touchEndX > 0) {
          moveNext();
        } else {
          movePrev();
        }
      },
      { passive: true },
    );
  });

  updateStackLayers();
  checkAllMainHeadingsTruncation();

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      checkAllMainHeadingsTruncation();
    });

    mainSlides.forEach((slide) => resizeObserver.observe(slide));
    descSlides.forEach((slide) => resizeObserver.observe(slide));
  }

  const orientationQuery = window.matchMedia("(orientation: landscape)");

  function handleOrientationChange() {
    setTimeout(() => {
      checkAllMainHeadingsTruncation();
    }, 150);
  }

  if (orientationQuery.addEventListener) {
    orientationQuery.addEventListener("change", handleOrientationChange);
  } else {
    orientationQuery.addListener(handleOrientationChange);
  }
}

export function initAdvantagesPopup() {
  const cardMainBlock = document.querySelector(".card-main");
  const cardDescBlock = document.querySelector(".card-desc");
  if (!cardMainBlock || !cardDescBlock) return;

  const mainSlides = Array.from(
    cardMainBlock.querySelectorAll(".card-main__slide"),
  );
  const descSlides = Array.from(
    cardDescBlock.querySelectorAll(".card-desc__slider"),
  );
  if (!mainSlides.length || !descSlides.length) return;

  const showMoreBtn = document.querySelector(".advantages__btn-show-more");

  const popup = document.getElementById("advantagesPopup");
  const popupTitle = popup
    ? popup.querySelector(".advantages-popup__title")
    : null;
  const popupText = popup
    ? popup.querySelector(".advantages-popup__text")
    : null;
  const popupCloseBtn = popup
    ? popup.querySelector(".popup__close") || popup.querySelector("button")
    : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  let lastActiveElement = null;
  let currentIndex = 0;

  function openPopup() {
    if (!popup || !popupTitle || !popupText) return;

    const currentActiveSlide = mainSlides[currentIndex];
    const currentHeading = currentActiveSlide
      ? currentActiveSlide.querySelector(".card-main__heading")
      : null;

    const currentActiveDesc = descSlides[currentIndex];
    const currentText = currentActiveDesc
      ? currentActiveDesc.querySelector(".card-desc__text")
      : null;

    if (currentHeading && currentText) {
      popupTitle.textContent = currentHeading.textContent;
      popupText.textContent = currentText.textContent;
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      if (popupCloseBtn) popupCloseBtn.focus();

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  cardDescBlock.addEventListener("click", (e) => {
    if (e.target.classList.contains("card-desc__btn")) {
      lastActiveElement = e.target;
      openPopup();
    }
  });

  if (popupCloseBtn) popupCloseBtn.addEventListener("click", closePopup);
  if (popupOverlay) popupOverlay.addEventListener("click", closePopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closePopup();
    }
  });

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      cardDescBlock.classList.toggle("is-open");
      showMoreBtn.classList.toggle("is-active");
    });
  }
}
