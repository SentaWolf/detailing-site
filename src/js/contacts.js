import { gsap } from "gsap";

export function initContactsEqualizer() {
  const container = document.getElementById("contactsEqualizerAmbient");
  const track = document.getElementById("contactsEqualizerTrack");
  if (!container || !track) return;

  const RAY_WIDTH = 32;

  const rayTemplate = [
    { height: 80, type: "contacts-equalizer-ray--cream" },
    { height: 70, type: "contacts-equalizer-ray--light-blue" },
    { height: 60, type: "contacts-equalizer-ray--light-green" },
    { height: 50, type: "contacts-equalizer-ray--dark-green" },
    { height: 40, type: "contacts-equalizer-ray--dark-blue" },
    { height: 40, type: "contacts-equalizer-ray--dark-blue" },
    { height: 50, type: "contacts-equalizer-ray--dark-green" },
    { height: 60, type: "contacts-equalizer-ray--light-green" },
    { height: 70, type: "contacts-equalizer-ray--light-blue" },
    { height: 80, type: "contacts-equalizer-ray--cream" },
  ];

  function generateEqualizer() {
    track.innerHTML = "";

    const totalRaysNeeded = Math.ceil(window.innerWidth / RAY_WIDTH);

    for (let i = 0; i < totalRaysNeeded; i++) {
      const ray = document.createElement("div");
      const config = rayTemplate[i % rayTemplate.length];

      ray.className = `contacts-equalizer-ray ${config.type}`;
      ray.style.height = `${config.height}px`;
      const colorName = config.type.replace("contacts-equalizer-ray--", "");
      ray.dataset.colorName = colorName;

      track.appendChild(ray);
    }

    animateEqualizerWave();
  }

  function animateEqualizerWave() {
    const allRays = track.querySelectorAll(".contacts-equalizer-ray");
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

// export async function initContactsMap() {
//   const mapContainer = document.getElementById("servicesMap");
//   if (!mapContainer || typeof ymaps3 === "undefined") return;

//   await ymaps3.ready;

//   const {
//     YMap,
//     YMapDefaultSchemeLayer,
//     YMapDefaultFeaturesLayer,
//     YMapControls,
//   } = ymaps3;

//   const { YMapDefaultMarker } = await ymaps3.import(
//     "@yandex/ymaps3-markers@0.0.1",
//   );
//   const { YMapZoomControl, YMapGeolocationControl } = await ymaps3.import(
//     "@yandex/ymaps3-controls@0.0.1",
//   );
//   const { YMapRouter } = await ymaps3.import("@yandex/ymaps3-router@0.0.1");

//   const studioCoordinates = [35.931758, 56.827823];

//   const map = new YMap(mapContainer, {
//     location: {
//       center: studioCoordinates,
//       zoom: 16,
//     },
//     behaviors: ["drag", "dblClick"],
//   });

//   // Возвращаем стандартную, встроенную тёмную тему Яндекса без лишних массивов
//   map.addChild(
//     new YMapDefaultSchemeLayer({
//       theme: "dark",
//     }),
//   );

//   map.addChild(new YMapDefaultFeaturesLayer());

//   // Панель управления справа (масштабирование + определение местоположения)
//   const controlsContainer = new YMapControls({ position: "right" });
//   controlsContainer.addChild(new YMapZoomControl({}));
//   controlsContainer.addChild(new YMapGeolocationControl({}));
//   map.addChild(controlsContainer);

//   // Кастомный маркер-булавка
//   const markerElement = document.createElement("img");
//   markerElement.src = "/src/assets/icons/logo.svg";
//   markerElement.style.width = "40px";
//   markerElement.style.height = "40px";
//   markerElement.style.transform = "translate(-50%, -100%)";

//   const customMarker = new YMapDefaultMarker({
//     coordinates: studioCoordinates,
//     color: "#00E5FF",
//     element: markerElement,
//     popup: {
//       position: "top",
//       content: `
//         <div style="padding: 10px; color: #000; font-family: sans-serif; min-width: 180px;">
//           <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #111;">AutoMania</h4>
//           <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">Тверь, Промышленный пр., 1<br>Ежедневно: 10:00 - 20:00</p>
//           <a href="https://yandex.ru" target="_blank" style="display: inline-block; font-size: 12px; color: #00E5FF; text-decoration: none; font-weight: bold;">Маршрут в Навигаторе →</a>
//         </div>
//       `,
//     },
//   });

//   map.addChild(customMarker);

//   // Независимая кнопка «Построить маршрут» поверх карты
//   const routeBtn = document.createElement("button");
//   routeBtn.type = "button";
//   routeBtn.innerText = "Построить маршрут";
//   routeBtn.style.cssText = `
//     position: absolute;
//     top: 20px;
//     left: 20px;
//     z-index: 1000;
//     background: #687069;
//     color: #fff;
//     border: none;
//     padding: 12px 16px;
//     font-family: "Montserrat", sans-serif;
//     font-size: 14px;
//     font-weight: 400;
//     text-transform: uppercase;
//     cursor: pointer;
//     border-radius: 4px;
//     box-shadow: 0 4px 12px 0 #a0b196;
//     transition: transform 0.2s;
//   `;

//   routeBtn.onmouseenter = () => (routeBtn.style.transform = "scale(1.05)");
//   routeBtn.onmouseleave = () => (routeBtn.style.transform = "scale(1)");

//   routeBtn.onclick = () => {
//     window.open(
//       "https://yandex.ru/maps/?rtext=~56.828215,35.931806&rtt=mt",
//       "_blank",
//     );
//   };

//   mapContainer.style.position = "relative";
//   mapContainer.appendChild(routeBtn);
// }
