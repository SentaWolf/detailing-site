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

export async function initContactsMap() {
  const mapContainer = document.getElementById("servicesMap");
  if (!mapContainer || typeof ymaps3 === "undefined") return;

  // Ждем, пока движок Яндекса полностью загрузит модули в память
  await ymaps3.ready;

  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;
  // Модуль для создания кастовных маркеров (Default Marker)
  const { YMapDefaultMarker } = await ymaps3.import(
    "@yandex/ymaps3-markers@0.0.1",
  );

  // КООРДИНАТЫ ВАШЕЙ СТУДИИ (Тверь, Промышленный пр., 1)
  // Внимание: В API 3.0 координаты пишутся в порядке [ДОЛГОТА, ШИРОТА]!
  const studioCoordinates = [35.946399, 56.849855];

  // 1. Создаем саму интерактивную карту
  const map = new YMap(mapContainer, {
    location: {
      center: studioCoordinates, // Центрируем карту на студии
      zoom: 16, // Масштаб (оптимально для городов, чтобы видеть улицы)
    },
  });

  // 2. Добавляем стандартный слой схемы дорог и домов
  map.addChild(
    new YMapDefaultSchemeLayer({
      theme: "dark", // МАГИЯ: Автоматически включает ТЕМНУЮ премиальную тему карты под ваш сайт!
    }),
  );

  map.addChild(new YMapDefaultFeaturesLayer());

  // 3. Создаем ваш ОСОБЫЙ КАСТОМНЫЙ ЗНАЧЕК-МАРКЕР компании
  const customMarker = new YMapDefaultMarker({
    coordinates: studioCoordinates,
    title: "AutoMania",
    subtitle: "Детейлинг-студия премиум класса",
    color: "#00E5FF", // Цвет выноски-ножки маркера под ваш $light-blue

    // ВШИВАЕМ ВАШУ КАРТИНКУ-МАРКЕР ИЗ ФИГМЫ:
    iconName: "custom",
    iconHref: "/src/assets/icons/map-pin.svg", // Путь к вашей кастомной иконке логотипа
    iconWidth: 40, // Фиксированная ширина значка
    iconHeight: 40, // Фиксированная высота значка
  });

  // Сажаем маркер на карту
  map.addChild(customMarker);
}
