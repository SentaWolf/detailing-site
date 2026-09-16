import { gsap } from "gsap";

export function initEqualizer(containerId, trackId, rayTemplate, options = {}) {
  const container = document.getElementById(containerId);
  const track = document.getElementById(trackId);
  if (!container || !track) return;

  const RAY_WIDTH = options.rayWidth || 32;
  let resizeTimeout = null;
  let timeline = null;
  let isVisible = false;

  function generateEqualizer() {
    track.innerHTML = "";

    const totalRaysNeeded = Math.ceil(window.innerWidth / RAY_WIDTH);

    for (let i = 0; i < totalRaysNeeded; i++) {
      const ray = document.createElement("div");
      const config = rayTemplate[i % rayTemplate.length];

      ray.className = `equalizer-ray equalizer-ray--${config.color}`;
      ray.style.height = `${config.height}px`;
      ray.dataset.colorName = config.color;

      track.appendChild(ray);
    }

    // Если блок видим — заново запускаем анимацию после перегенерации
    if (isVisible) {
      animateEqualizerWave();
    } else {
      // Иначе — статичные цвета
      setStaticColors();
    }
  }

  function setStaticColors() {
    const allRays = track.querySelectorAll(".equalizer-ray");
    allRays.forEach((ray) => {
      const color = ray.dataset.colorName;
      const normal = colorMap[color]?.normal || "rgba(255,255,255,0.2)";
      ray.style.backgroundColor = normal;
    });
  }

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

  function animateEqualizerWave() {
    // Сначала убиваем старый timeline, если он был
    if (timeline) {
      timeline.kill();
      timeline = null;
    }

    const allRays = track.querySelectorAll(".equalizer-ray");
    if (allRays.length === 0) return;

    timeline = gsap.timeline({ repeat: -1 });

    timeline.to(allRays, {
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

  // Останавливаем анимацию, когда блок ушёл за экран
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;

          if (isVisible) {
            animateEqualizerWave();
          } else {
            if (timeline) {
              timeline.pause();
            }
          }
        });
      },
      { threshold: 0 },
    );

    observer.observe(container);
  }

  window.addEventListener("resize", () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(generateEqualizer, 200);
  });
}

export const contactsTemplate = [
  { height: 80, color: "cream" },
  { height: 70, color: "light-blue" },
  { height: 60, color: "light-green" },
  { height: 50, color: "dark-green" },
  { height: 40, color: "dark-blue" },
  { height: 40, color: "dark-blue" },
  { height: 50, color: "dark-green" },
  { height: 60, color: "light-green" },
  { height: 70, color: "light-blue" },
  { height: 80, color: "cream" },
];
initEqualizer(
  "contactsEqualizerAmbient",
  "contactsEqualizerTrack",
  contactsTemplate,
);

export const reviewsTemplate = [
  { height: 40, color: "dark-blue" },
  { height: 50, color: "dark-green" },
  { height: 60, color: "light-green" },
  { height: 70, color: "light-blue" },
  { height: 80, color: "cream" },
  { height: 80, color: "cream" },
  { height: 70, color: "light-blue" },
  { height: 60, color: "light-green" },
  { height: 50, color: "dark-green" },
  { height: 40, color: "dark-blue" },
];
initEqualizer(
  "reviewsEqualizerAmbient",
  "reviewsEqualizerTrack",
  reviewsTemplate,
);

export const servicesTemplate = [
  { height: 80, color: "cream" },
  { height: 70, color: "light-blue" },
  { height: 60, color: "light-green" },
  { height: 50, color: "dark-green" },
  { height: 40, color: "dark-blue" },
  { height: 40, color: "dark-blue" },
  { height: 50, color: "dark-green" },
  { height: 60, color: "light-green" },
  { height: 70, color: "light-blue" },
  { height: 80, color: "cream" },
];
initEqualizer(
  "servicesEqualizerAmbient",
  "servicesEqualizerTrack",
  servicesTemplate,
);

export const galleryTemplate = [
  { height: 40, color: "dark-blue" },
  { height: 50, color: "dark-green" },
  { height: 60, color: "light-green" },
  { height: 70, color: "light-blue" },
  { height: 80, color: "cream" },
  { height: 80, color: "cream" },
  { height: 70, color: "light-blue" },
  { height: 60, color: "light-green" },
  { height: 50, color: "dark-green" },
  { height: 40, color: "dark-blue" },
];
initEqualizer(
  "galleryEqualizerAmbient",
  "galleryEqualizerTrack",
  galleryTemplate,
);
