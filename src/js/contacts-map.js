export async function initContactsMap() {
  const mapContainer = document.getElementById("servicesMap");
  if (!mapContainer) return;

  if (typeof ymaps3 === "undefined") {
    await loadYandexMapsApi();
  }

  await ymaps3.ready;

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapControls,
  } = ymaps3;

  const { YMapDefaultMarker } = await ymaps3.import(
    "@yandex/ymaps3-markers@0.0.1",
  );
  const { YMapZoomControl, YMapGeolocationControl } = await ymaps3.import(
    "@yandex/ymaps3-controls@0.0.1",
  );

  // Читаем координаты из data-атрибутов контейнера
  const lat = parseFloat(mapContainer.dataset.lat) || 56.827823;
  const lng = parseFloat(mapContainer.dataset.lng) || 35.931758;
  const studioCoordinates = [lng, lat];
  let isRouteBuilding = false;
  let activeButton = null;

  const map = new YMap(mapContainer, {
    location: {
      center: studioCoordinates,
      zoom: 16,
    },
    behaviors: ["drag", "dblClick", "pinchZoom"],
  });

  map.addChild(new YMapDefaultSchemeLayer({ theme: "dark" }));
  map.addChild(new YMapDefaultFeaturesLayer());

  const controlsContainer = new YMapControls({ position: "right" });
  controlsContainer.addChild(new YMapZoomControl({}));
  controlsContainer.addChild(new YMapGeolocationControl({}));
  map.addChild(controlsContainer);

  // Создаем абсолютно кастомный маркер-круг
  const studioMarkerElement = document.createElement("div");
  studioMarkerElement.className = "map-marker map-marker--studio";

  studioMarkerElement.innerHTML = `
    <img src="${window.mapMarkerIcon}" alt="${window.mapMarkerAlt}">
  `;
  const studioMarker = new ymaps3.YMapMarker(
    {
      coordinates: studioCoordinates,
    },
    studioMarkerElement,
  );

  map.addChild(studioMarker);

  // Создаем главную кнопку «Построить маршрут» поверх карты
  const routeBtn = document.createElement("button");
  routeBtn.className = "map-route-btn";
  routeBtn.type = "button";
  routeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L14 8L8 15L2 8L8 1Z" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="8" cy="8" r="2" fill="currentColor"/>
    </svg>
    <span>Построить маршрут</span>
  `;
  mapContainer.appendChild(routeBtn);

  // Создаем универсальное модальное окно (выбор: геолокация или ручной ввод)
  const addressModal = document.createElement("div");
  addressModal.className = "address-modal";
  addressModal.innerHTML = `
    <div class="address-modal__overlay"></div>
    <div class="address-modal__content">
      <div class="address-modal__header">
        <h3>Как построить маршрут?</h3>
        <button class="address-modal__close">&times;</button>
      </div>
      <div class="address-modal__body">
        <div class="address-modal__choices">
          <button type="button" class="address-modal__btn-geo">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right:6px; vertical-align:middle;"><path d="M8 0a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z"/></svg>
            Определить геолокацию
          </button>
          <div class="address-modal__divider">или укажите адрес вручную</div>
        </div>
        <input type="text" 
  class="address-modal__input" 
  id="userAddress"
  name="address"
  placeholder="Например: Тверь, ул. Ленина, 10"
  autocomplete="street-address">
        <div class="address-modal__error" style="display:none;color:#ff6b6b;font-size:12px;margin-top:8px;"></div>
      </div>
      <div class="address-modal__footer">
        <button class="address-modal__cancel">Отмена</button>
        <button class="address-modal__confirm">Построить маршрут</button>
      </div>
    </div>
  `;
  document.body.appendChild(addressModal);

  const closeModalBtn = addressModal.querySelector(".address-modal__close");
  const cancelModalBtn = addressModal.querySelector(".address-modal__cancel");
  const confirmModalBtn = addressModal.querySelector(".address-modal__confirm");
  const geoModalBtn = addressModal.querySelector(".address-modal__btn-geo");
  const overlay = addressModal.querySelector(".address-modal__overlay");
  const inputAddress = addressModal.querySelector(".address-modal__input");
  const errorDiv = addressModal.querySelector(".address-modal__error");

  routeBtn.addEventListener("click", () => {
    if (isRouteBuilding) return;
    addressModal.classList.add("address-modal--show");
    errorDiv.style.display = "none";
    setTimeout(() => inputAddress.focus(), 100);
  });

  function closeAddressModal() {
    addressModal.classList.remove("address-modal--show");
    inputAddress.value = "";
    errorDiv.style.display = "none";
    resetLoadingState();
  }

  closeModalBtn.addEventListener("click", closeAddressModal);
  cancelModalBtn.addEventListener("click", closeAddressModal);
  overlay.addEventListener("click", closeAddressModal);

  geoModalBtn.addEventListener("click", async () => {
    const newWindow = window.open("about:blank", "_blank");

    try {
      setLoadingState(geoModalBtn, "Определение...");
      const userCoordinates = await getGeolocation();
      closeAddressModal();
      await handleRoute(userCoordinates, newWindow);
    } catch (error) {
      if (newWindow) newWindow.close();
      errorDiv.textContent =
        "Не удалось определить локацию. Введите адрес вручную.";
      errorDiv.style.display = "block";
      resetLoadingState();
    }
  });

  confirmModalBtn.addEventListener("click", async () => {
    const address = inputAddress.value.trim();

    if (!address) {
      errorDiv.textContent = "Введите адрес";
      errorDiv.style.display = "block";
      return;
    }

    const newWindow = window.open("about:blank", "_blank");

    try {
      setLoadingState(confirmModalBtn, "Поиск...");
      const coordinates = await geocodeAddress(address);
      closeAddressModal();
      await handleRoute(coordinates, newWindow);
    } catch (error) {
      if (newWindow) newWindow.close();
      errorDiv.textContent = "Адрес не найден. Уточните город и улицу.";
      errorDiv.style.display = "block";
      resetLoadingState();
    }
  });

  inputAddress.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      confirmModalBtn.click();
    }
  });

  function setLoadingState(btn, text) {
    isRouteBuilding = true;
    activeButton = btn;
    btn.disabled = true;
    btn.dataset.oldText = btn.innerHTML;
    btn.innerHTML = `<span>${text}</span>`;
  }

  function resetLoadingState() {
    isRouteBuilding = false;
    if (activeButton) {
      activeButton.disabled = false;
      if (activeButton.dataset.oldText) {
        activeButton.innerHTML = activeButton.dataset.oldText;
        delete activeButton.dataset.oldText;
      }
      activeButton = null;
    }
  }

  function getGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Геолокация не поддерживается"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.longitude, position.coords.latitude]);
        },
        () => reject(new Error("Геолокация недоступна")),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 },
      );
    });
  }

  async function geocodeAddress(address) {
    const fullAddress = address.toLowerCase().includes("тверь")
      ? address
      : `Тверь, ${address}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AutoServiceSiteContactMap/1.0",
        },
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      if (data && data.length > 0) {
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }

      throw new Error();
    } catch (error) {
      throw new Error("Не удалось найти адрес");
    }
  }

  async function handleRoute(userCoordinates, newWindow) {
    const center = [
      (userCoordinates[0] + studioCoordinates[0]) / 2,
      (userCoordinates[1] + studioCoordinates[1]) / 2,
    ];

    map.setLocation({
      center: center,
      zoom: 12,
      duration: 500,
    });

    const mapsUrl = `https://yandex.ru/maps/?rtext=${userCoordinates[1]},${userCoordinates[0]}~${studioCoordinates[1]},${studioCoordinates[0]}&rtt=auto`;

    showToast("Открываем маршрут в Яндекс.Картах...");

    setTimeout(() => {
      if (newWindow) {
        newWindow.location.href = mapsUrl;
      }
    }, 400);
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "map-toast";
    toast.textContent = message;
    mapContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("map-toast--show");
    });

    setTimeout(() => {
      toast.classList.remove("map-toast--show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

function loadYandexMapsApi() {
  return new Promise((resolve, reject) => {
    // Если скрипт уже загружается — ждём
    const existing = document.querySelector(
      'script[src*="api-maps.yandex.ru"]',
    );
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://api-maps.yandex.ru/v3/?apikey=db41ff64-1031-4108-a5e1-ad6b420ab6d5&lang=ru_RU";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
