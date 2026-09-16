import { gsap } from "gsap";

export function animateContactsLinesWave() {
  const layerLines = document.querySelector(".contacts__layer-lines");
  if (!layerLines) return;

  const isMobile = window.matchMedia(
    "(hover: none), (pointer: coarse)",
  ).matches;
  if (!isMobile) return;

  const allLines = layerLines.querySelectorAll(".line");
  if (allLines.length === 0) return;

  const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: 1.2,
    paused: true, // ← стартуем на паузе
  });

  tl.to(allLines, {
    y: -40,
    duration: 0.4,
    ease: "power4.out",
    stagger: {
      each: 0.1,
      from: "start",
    },
  });

  tl.to(allLines, {
    y: -30,
    duration: 0.8,
    ease: "elastic.out(1, 0.4)",
    stagger: {
      each: 0.1,
      from: "start",
    },
  });

  tl.to(allLines, {
    y: 0,
    duration: 0.5,
    ease: "power2.in",
    stagger: {
      each: 0.08,
      from: "start",
    },
  });

  // Останавливаем, когда блок не виден
  const contactsBlock = document.querySelector(".contacts");
  if (!contactsBlock) return;

  let isPlaying = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isPlaying) {
          tl.play();
          isPlaying = true;
        } else if (!entry.isIntersecting && isPlaying) {
          tl.pause();
          isPlaying = false;
        }
      });
    },
    { threshold: 0 },
  );

  observer.observe(contactsBlock);
}
