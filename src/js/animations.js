import { gsap } from "gsap";

export function initEqualizer(containerId, trackId, rayTemplate, options = {}) {
  const container = document.getElementById(containerId);
  const track = document.getElementById(trackId);
  if (!container || !track) return;

  const RAY_WIDTH = options.rayWidth || 32;

  function generateEqualizer() {
    track.innerHTML = "";

    const totalRaysNeeded = Math.ceil(window.innerWidth / RAY_WIDTH);

    for (let i = 0; i < totalRaysNeeded; i++) {
      const ray = document.createElement("div");
      const config = rayTemplate[i % rayTemplate.length];

      // Новые классы: equalizer-ray + модификатор цвета
      ray.className = `equalizer-ray equalizer-ray--${config.color}`;
      ray.style.height = `${config.height}px`;
      ray.dataset.colorName = config.color;

      track.appendChild(ray);
    }

    animateEqualizerWave();
  }

  function animateEqualizerWave() {
    const allRays = track.querySelectorAll(".equalizer-ray");
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
    if (window.equalizerTimeout) clearTimeout(window.equalizerTimeout);
    window.equalizerTimeout = setTimeout(generateEqualizer, 200);
  });
}

const contactsTemplate = [
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

const reviewsTemplate = [
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

const servicesTemplate = [
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
