import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initHeroAnchorScroll() {
  const heroBtn = document.querySelector(".hero__btn");
  const targetSection = document.getElementById("contactsFormSection");

  if (!heroBtn || !targetSection) return;

  heroBtn.addEventListener("click", () => {
    gsap.to(window, {
      duration: 0.8,
      scrollTo: {
        y: targetSection,
        offsetY: 0,
      },
      ease: "power1.inOut",
    });
  });
}

export function initHeroAnimation() {
  const getElements = () => ({
    carTrigger: document.querySelector(".car-trigger"),
    layerBg: document.querySelector(".layer-bg"),
  });

  const { carTrigger, layerBg } = getElements();

  if (carTrigger && layerBg) {
    attachEvents(carTrigger, layerBg);
  } else {
    window.addEventListener("load", () => {
      const retry = getElements();
      if (retry.carTrigger && retry.layerBg) {
        attachEvents(retry.carTrigger, retry.layerBg);
      }
    });
  }
}

function attachEvents(trigger, bgImage) {
  const carContainer = trigger.closest(".hero__car");
  const heroBtn = document.querySelector(".hero__btn");

  const activateEffect = () => {
    bgImage.classList.add("is-blurred");
    if (carContainer) carContainer.classList.add("is-hovered");
  };

  const deactivateEffect = () => {
    const isMouseOverCar = carContainer && carContainer.matches(":hover");
    const isMouseOverBtn = heroBtn && heroBtn.matches(":hover");

    if (!isMouseOverCar && !isMouseOverBtn) {
      bgImage.classList.remove("is-blurred");
      if (carContainer) carContainer.classList.remove("is-hovered");
    }
  };

  trigger.addEventListener("mouseenter", activateEffect);
  if (heroBtn) {
    heroBtn.addEventListener("mouseenter", activateEffect);
  }

  trigger.addEventListener("mouseleave", (e) => {
    const movedToBtn =
      heroBtn &&
      e.relatedTarget instanceof Element &&
      e.relatedTarget.closest(".hero__btn");
    if (!movedToBtn) {
      deactivateEffect();
    }
  });

  if (heroBtn) {
    heroBtn.addEventListener("mouseleave", (e) => {
      const movedToTrigger =
        e.relatedTarget instanceof Element &&
        e.relatedTarget.closest(".car-trigger");
      if (!movedToTrigger) {
        deactivateEffect();
      }
    });
  }

  let scrollTimeout = null;

  window.addEventListener(
    "scroll",
    () => {
      activateEffect();

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        deactivateEffect();
      }, 150);
    },
    { passive: true },
  );
}

export function initHeroParallax() {
  const heroBlock = document.querySelector(".hero");
  if (!heroBlock) return;

  const isTouchDevice = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  if (isTouchDevice) return;

  const layerBg = heroBlock.querySelector(".layer-bg");
  const layerLines = heroBlock.querySelector(".layer-lines");
  const layerFront = heroBlock.querySelector(".layer-front");

  if (!layerBg || !layerLines || !layerFront) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroBlock,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  tl.to(
    layerBg,
    {
      yPercent: 30,
      ease: "none",
    },
    0,
  )
    .to(
      layerLines,
      {
        yPercent: 15,
        ease: "none",
      },
      0,
    )
    .to(
      layerFront,
      {
        yPercent: -40,
        ease: "none",
      },
      0,
    );
}

export function animateHeroLinesOnLoad() {
  const layerLines = document.querySelector(".layer-lines");
  if (!layerLines) return;

  const allLines = layerLines.querySelectorAll(".line");
  if (allLines.length === 0) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;

  gsap.set(allLines, {
    y: "-150vh",
    opacity: 0,
  });

  const tl = gsap.timeline();

  tl.to(allLines, {
    y: 0,
    opacity: 1,
    duration: 1.8,
    ease: "elastic.out(1, 0.6)",
    stagger: {
      each: 0.15,
      from: "start",
    },
  });

  // На мобильных — после появления запускаем постоянные «прыжки»
  if (isMobile) {
    tl.then(() => {
      // Сохраняем все tween'ы
      const jumpTweens = [];

      allLines.forEach((line, index) => {
        const tween = gsap.to(line, {
          y: "+=30",
          duration: 0.6 + Math.random() * 0.4,
          delay: index * 0.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          paused: true, // ← стартуем на паузе
        });
        jumpTweens.push(tween);
      });

      // Запускаем/останавливаем по видимости
      const heroBlock = document.querySelector(".hero");
      if (!heroBlock) return;

      let isPlaying = false;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isPlaying) {
              jumpTweens.forEach((t) => t.play());
              isPlaying = true;
            } else if (!entry.isIntersecting && isPlaying) {
              jumpTweens.forEach((t) => t.pause());
              isPlaying = false;
            }
          });
        },
        { threshold: 0 },
      );

      observer.observe(heroBlock);
    });
  }
}
