import { gsap } from "gsap";

export function initPortfolioAmbientLight() {
  const container = document.getElementById("portfolioLight");
  const wheel = document.getElementById("lightWheel");
  if (!container || !wheel) return;

  const isMobile = window.innerWidth < 1024;
  const TOTAL_RAYS = isMobile ? 40 : 120;
  const angleStep = 360 / TOTAL_RAYS;

  wheel.innerHTML = "";

  for (let i = 0; i < TOTAL_RAYS; i++) {
    const ray = document.createElement("div");
    ray.className = "portfolio-ray";

    const currentAngle = i * angleStep;

    const baseWidth = 2 + Math.random() * 16;
    const baseHeight = 100 + Math.random() * 60;
    const baseBlur = 2 + Math.random() * 22;

    gsap.set(ray, {
      "--beam-w": `${baseWidth}px`,
      "--beam-h": `${baseHeight}vh`,
      "--beam-blur": `${baseBlur}px`,
      "--beam-rot": `${currentAngle}deg`,
    });

    wheel.appendChild(ray);

    gsap.to(ray, {
      "--beam-w": `${baseWidth * 1.2}px`,
      "--beam-h": `${baseHeight * 1.3}vh`,
      "--beam-blur": `${baseBlur * 0.8}px`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  gsap.to(wheel, {
    rotate: () => gsap.utils.random(12, 18),
    duration: () => gsap.utils.random(12, 16),
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

const FALLBACK_FONT_SIZE = 16;
const FALLBACK_LINE_HEIGHT = 1.3;
const SUBPIXEL_BUFFER = 2;
const VISIBLE_ITEMS_LIMIT = 3;

export function checkAllPortfolioTextTruncation() {
  const portfolioBlock = document.querySelector(".portfolio");
  if (!portfolioBlock) return;

  const slides = Array.from(
    portfolioBlock.querySelectorAll(".portfolio__slide"),
  );

  const baseSlide = slides[0];
  if (!baseSlide) return;

  const infoContent = baseSlide.querySelector(".portfolio__info-content");
  const metaList = baseSlide.querySelector(".portfolio__meta-list");
  const moreBtn = baseSlide.querySelector(".portfolio__more-btn");
  if (!infoContent || !metaList || !moreBtn) return;

  requestAnimationFrame(() => {
    const allMetaItems = Array.from(
      metaList.querySelectorAll(
        ".portfolio__meta-list > .portfolio__meta-item",
      ),
    );
    const thirdItem = allMetaItems[2];
    const descText = baseSlide.querySelector(".portfolio__desc-text");
    if (!thirdItem || !descText) return;

    descText.style.webkitLineClamp = "unset";
    descText.style.maxHeight = "unset";

    const computedTextStyle = window.getComputedStyle(descText);
    const fontSize =
      parseFloat(computedTextStyle.fontSize) || FALLBACK_FONT_SIZE;
    const lineHeightVal = computedTextStyle.lineHeight;
    const parsedLineHeight = parseFloat(lineHeightVal);
    const singleLineHeight = lineHeightVal.includes("px")
      ? parseFloat(lineHeightVal)
      : fontSize *
        (!isNaN(parsedLineHeight) ? parsedLineHeight : FALLBACK_LINE_HEIGHT);

    const listStyle = window.getComputedStyle(metaList);
    const currentDirection = listStyle.flexDirection;
    const maxMetaListHeight = metaList.clientHeight;
    const listGap =
      parseFloat(listStyle.rowGap) || parseFloat(listStyle.gap) || 0;

    let number2 = 0;

    if (currentDirection === "row") {
      const descLabel = thirdItem.querySelector(".portfolio__meta-label");
      const descLabelH = descLabel
        ? descLabel.getBoundingClientRect().height
        : 0;

      const thirdItemStyle = window.getComputedStyle(thirdItem);
      const itemGap3 =
        parseFloat(thirdItemStyle.rowGap) ||
        parseFloat(thirdItemStyle.gap) ||
        0;

      number2 = maxMetaListHeight - descLabelH - itemGap3;
    } else {
      let topItemsHeight = 0;
      for (let i = 0; i < 2; i++) {
        if (allMetaItems[i]) {
          topItemsHeight += allMetaItems[i].getBoundingClientRect().height;
        }
      }

      const label3 = thirdItem.querySelector(".portfolio__meta-label");
      const label3H = label3 ? label3.getBoundingClientRect().height : 0;

      let number1 = topItemsHeight + label3H + 2 * listGap;

      number2 = maxMetaListHeight - number1;
    }

    const safeNumber2 = number2 - SUBPIXEL_BUFFER;
    const totalLinesTextHas = Math.round(
      descText.scrollHeight / singleLineHeight,
    );

    let maxPossibleLines = Math.floor(safeNumber2 / singleLineHeight);

    if (maxPossibleLines > 0) {
      portfolioBlock.style.setProperty("--desc-clamp", maxPossibleLines);
      portfolioBlock.style.setProperty(
        "--desc-line-height",
        `${singleLineHeight}px`,
      );
    }

    const allowedTextMaxHeight = maxPossibleLines * singleLineHeight;

    slides.forEach((slide) => {
      const currentMetaList = slide.querySelector(".portfolio__meta-list");
      const currentMoreBtn = slide.querySelector(".portfolio__more-btn");
      const currentDescText = slide.querySelector(".portfolio__desc-text");
      if (!currentMetaList || !currentMoreBtn || !currentDescText) return;

      const currentMetaItems = Array.from(
        currentMetaList.querySelectorAll(
          ".portfolio__meta-list > .portfolio__meta-item",
        ),
      );

      let slideHasExtraItems = false;
      currentMetaItems.forEach((item, idx) => {
        if (idx >= VISIBLE_ITEMS_LIMIT) {
          item.style.display = "none";
          slideHasExtraItems = true;
        } else {
          item.style.display = "";
        }
      });

      currentMoreBtn.style.display = "none";

      let slideTextOverflows =
        currentDescText.scrollHeight > allowedTextMaxHeight;

      if (slideTextOverflows && maxPossibleLines > 0) {
        currentDescText.style.webkitLineClamp = maxPossibleLines;
        currentDescText.style.maxHeight = `${maxPossibleLines * singleLineHeight}px`;

        currentMoreBtn.style.display = "block";
      } else {
        currentDescText.style.webkitLineClamp = "";
        currentDescText.style.maxHeight = "";

        currentMoreBtn.style.display = slideHasExtraItems ? "block" : "none";
      }
    });
  });
}

export function initPortfolioBeforeAfter() {
  const portfolioBlock = document.querySelector(".portfolio");
  if (!portfolioBlock) return;

  const allSlides = portfolioBlock.querySelectorAll(".portfolio__slide");
  allSlides.forEach((slide) => {
    const containerBefore = slide.querySelector(
      ".portfolio__image-container--before",
    );
    const containerAfter = slide.querySelector(
      ".portfolio__image-container--after",
    );

    if (containerBefore)
      gsap.set(containerBefore, {
        zIndex: 2,
        scale: 1,
        webkitMaskImage: "none",
        maskImage: "none",
      });
    if (containerAfter)
      gsap.set(containerAfter, {
        zIndex: 1,
        scale: 1,
        webkitMaskImage: "none",
        maskImage: "none",
      });

    slide.activeTimeline = null;
  });

  portfolioBlock.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".portfolio__toggle-btn");
    if (!toggleBtn || toggleBtn.classList.contains("is-active")) return;

    const currentSlide = toggleBtn.closest(".portfolio__slide");
    if (!currentSlide) return;

    const beforeBtn = currentSlide.querySelector('[data-type="before"]');
    const afterBtn = currentSlide.querySelector('[data-type="after"]');

    const containerBefore = currentSlide.querySelector(
      ".portfolio__image-container--before",
    );
    const containerAfter = currentSlide.querySelector(
      ".portfolio__image-container--after",
    );

    if (!containerBefore || !containerAfter) return;

    if (currentSlide.activeTimeline && currentSlide.activeTimeline.isActive()) {
      currentSlide.activeTimeline.progress(1).kill();
    }

    const clickType = toggleBtn.getAttribute("data-type");
    let outContainer, inContainer;

    if (clickType === "after") {
      beforeBtn.classList.remove("is-active");
      afterBtn.classList.add("is-active");
      outContainer = containerBefore;
      inContainer = containerAfter;
    } else {
      afterBtn.classList.remove("is-active");
      beforeBtn.classList.add("is-active");
      outContainer = containerAfter;
      inContainer = containerBefore;
    }

    gsap.set(inContainer, {
      zIndex: 1,
      scale: 1,
      webkitMaskImage: "none",
      maskImage: "none",
    });

    gsap.set(outContainer, {
      zIndex: 2,
      scale: 1,
      webkitMaskImage:
        "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
      maskImage:
        "radial-gradient(circle, transparent var(--mask-main), black calc(var(--mask-main) + 15%))",
      "--mask-main": "0%",
    });

    currentSlide.activeTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(inContainer, { zIndex: 2 });

        gsap.set(outContainer, {
          zIndex: 1,
          scale: 1,
          webkitMaskImage: "none",
          maskImage: "none",
          "--mask-main": "0%",
        });

        currentSlide.activeTimeline = null;
      },
    });

    currentSlide.activeTimeline.to(
      outContainer,
      {
        "--mask-main": "100%",
        scale: 0.7,
        duration: 0.8,
        ease: "expo.out",
      },
      0,
    );
  });
}

export function initPortfolioSlider() {
  const portfolioBlock = document.querySelector(".portfolio");
  if (!portfolioBlock) return;

  const track = portfolioBlock.querySelector(".portfolio__track");
  const slides = Array.from(
    portfolioBlock.querySelectorAll(".portfolio__slide"),
  );
  const nav = portfolioBlock.querySelector(".portfolio__nav");

  if (!track || slides.length < 2) return;

  const prevBtn = nav ? nav.querySelector(".prev") : null;
  const nextBtn = nav ? nav.querySelector(".next") : null;

  let currentIndex = 0;
  let activePortfolioTween = null;

  function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;

    if (currentIndex === 0) {
      prevBtn.classList.add("is-disabled");
    } else {
      prevBtn.classList.remove("is-disabled");
    }

    if (currentIndex === slides.length - 1) {
      nextBtn.classList.add("is-disabled");
    } else {
      nextBtn.classList.remove("is-disabled");
    }
  }

  function forceCloseMobileInfo() {
    const allOpenedInfos = portfolioBlock.querySelectorAll(
      ".portfolio__info.is-open",
    );
    const allActiveButtons = portfolioBlock.querySelectorAll(
      ".portfolio__btn-show-more.is-active",
    );

    allOpenedInfos.forEach((info) => info.classList.remove("is-open"));
    allActiveButtons.forEach((btn) => btn.classList.remove("is-active"));

    if (nav) {
      nav.style.opacity = "";
      nav.style.visibility = "";
      nav.style.pointerEvents = "";
    }
  }

  function goToSlide(index) {
    if (index < 0 || index > slides.length - 1) return;

    if (activePortfolioTween && activePortfolioTween.isActive()) {
      activePortfolioTween.progress(1).kill();
    }

    forceCloseMobileInfo();

    currentIndex = index;
    updateNavButtons();

    checkAllPortfolioTextTruncation();

    const slideWidth = slides[0].clientWidth;
    const slideStyle = window.getComputedStyle(slides[0]);
    const marginRight = parseFloat(slideStyle.marginRight) || 0;
    const stepWidth = slideWidth + marginRight;
    const targetX = index * stepWidth;

    activePortfolioTween = gsap.to(track, {
      x: -targetX,
      duration: 0.8,
      ease: "expo.out",
      onComplete: () => {
        activePortfolioTween = null;
      },
    });
  }

  function moveNext() {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  function movePrev() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  if (nav) {
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest(".portfolio__arrow-btn");
      if (!btn || btn.classList.contains("is-disabled")) return;

      if (btn.classList.contains("next")) {
        moveNext();
      } else if (btn.classList.contains("prev")) {
        movePrev();
      }
    });

    nav.style.transition = "opacity 0.4s ease, visibility 0.4s ease";
  }

  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener(
    "touchstart",
    (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchStartX = e.changedTouches[0].screenX;
      }
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }
    },
    { passive: true },
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) moveNext();
    if (touchEndX - touchStartX > swipeThreshold) movePrev();
  }

  window.addEventListener("resize", () => {
    if (track && slides[currentIndex]) {
      const slideWidth = slides[0].clientWidth;
      const marginRight =
        parseFloat(window.getComputedStyle(slides[0]).marginRight) || 0;

      gsap.set(track, { x: -(currentIndex * (slideWidth + marginRight)) });
    }
  });

  updateNavButtons();

  portfolioBlock.addEventListener("click", (e) => {
    const showMoreBtn = e.target.closest(".portfolio__btn-show-more");
    if (!showMoreBtn) return;

    const currentSlide = showMoreBtn.closest(".portfolio__slide");
    if (!currentSlide) return;

    const infoBlock = currentSlide.querySelector(".portfolio__info");
    if (infoBlock) {
      infoBlock.classList.toggle("is-open");
      showMoreBtn.classList.toggle("is-active");

      if (nav) {
        const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

        if (isTouchScreen && infoBlock.classList.contains("is-open")) {
          nav.style.opacity = "0";
          nav.style.visibility = "hidden";
          nav.style.pointerEvents = "none";
        } else {
          nav.style.opacity = "";
          nav.style.visibility = "";
          nav.style.pointerEvents = "";
        }
      }
    }
  });

  checkAllPortfolioTextTruncation();

  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      checkAllPortfolioTextTruncation();
    });

    slides.forEach((slide) => {
      const infoContent = slide.querySelector(".portfolio__info-content");
      if (infoContent) resizeObserver.observe(infoContent);
    });
  }

  const portfolioOrientationQuery = window.matchMedia(
    "(orientation: landscape)",
  );

  function handlePortfolioOrientationChange() {
    setTimeout(() => {
      checkAllPortfolioTextTruncation();
    }, 150);
  }

  if (portfolioOrientationQuery.addEventListener) {
    portfolioOrientationQuery.addEventListener(
      "change",
      handlePortfolioOrientationChange,
    );
  } else {
    portfolioOrientationQuery.addListener(handlePortfolioOrientationChange);
  }

  const popup = document.getElementById("portfolioPopup");
  const popupTitle = document.getElementById("portfolioPopupTitle");
  const popupTime = document.getElementById("portfolioPopupTime");
  const popupPrice = document.getElementById("portfolioPopupPrice");
  const popupText = document.getElementById("portfolioPopupText");
  const popupList = document.getElementById("portfolioPopupList");
  const popupCloseBtn = popup
    ? popup.querySelector(".popup__close") || popup.querySelector("button")
    : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  let lastActivePortfolioElement = null;

  function openPortfolioPopup() {
    if (
      !popup ||
      !popupTitle ||
      !popupTime ||
      !popupPrice ||
      !popupText ||
      !popupList
    )
      return;

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    const currentTitle = currentSlide.querySelector(".portfolio__info-title");
    const currentFullText = currentSlide.querySelector(".portfolio__desc-text");
    const currentMetaItems = Array.from(
      currentSlide.querySelectorAll(
        ".portfolio__meta-list > .portfolio__meta-item",
      ),
    );

    if (currentTitle && currentFullText) {
      popupTitle.textContent = currentTitle.textContent;
      popupText.textContent = currentFullText.textContent;

      if (currentMetaItems[0]) {
        const val1 = currentMetaItems[0].querySelector(
          ".portfolio__meta-value",
        );
        if (val1) popupTime.textContent = val1.textContent;
      }
      if (currentMetaItems[1]) {
        const val2 = currentMetaItems[1].querySelector(
          ".portfolio__meta-value",
        );
        if (val2) popupPrice.textContent = val2.textContent;
      }

      const existingPopupLis = Array.from(popupList.querySelectorAll("li"));
      existingPopupLis.forEach((li, idx) => {
        if (idx >= 3) li.remove();
      });

      currentMetaItems.forEach((origItem, idx) => {
        if (idx >= 3) {
          const origLabel = origItem.querySelector(".portfolio__meta-label");
          const origValue = origItem.querySelector(".portfolio__meta-value");

          if (origLabel && origValue) {
            const cloneItem = origItem.cloneNode(true);
            cloneItem.style.display = "";
            cloneItem.classList.add("portfolio-popup__item");

            const label = cloneItem.querySelector(".portfolio__meta-label");
            const value = cloneItem.querySelector(".portfolio__meta-value");
            if (label) label.classList.add("portfolio-popup__label");
            if (value) value.classList.add("portfolio-popup__value");

            popupList.appendChild(cloneItem);
          }
        }
      });

      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");

      if (popupCloseBtn) popupCloseBtn.focus();

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
  }

  function closePortfolioPopup() {
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    if (
      lastActivePortfolioElement &&
      typeof lastActivePortfolioElement.focus === "function"
    ) {
      lastActivePortfolioElement.focus();
    }
  }

  portfolioBlock.addEventListener("click", (e) => {
    if (e.target.classList.contains("portfolio__more-btn")) {
      lastActivePortfolioElement = e.target;
      openPortfolioPopup();
    }
  });

  if (popupCloseBtn) {
    popupCloseBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      closePortfolioPopup();
    });
  }
  if (popupOverlay) popupOverlay.addEventListener("click", closePortfolioPopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closePortfolioPopup();
    }
  });
}
