// /**
//  * Ленивая инициализация: запускает функцию только когда блок появится в зоне видимости.
//  *
//  * @param {string|Element} target - селектор или DOM-элемент для наблюдения
//  * @param {Function} initFn - функция инициализации анимации
//  * @param {Object} [options] - настройки
//  * @param {number} [options.rootMargin] - отступ от вьюпорта (например, "200px")
//  */
export function lazyInit(target, initFn, options = {}) {
  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  if (!element) return;

  // Если IntersectionObserver не поддерживается — запускаем сразу
  if (!("IntersectionObserver" in window)) {
    initFn();
    return;
  }

  let initialized = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !initialized) {
          initialized = true;
          initFn();
          observer.disconnect(); // ← отписываемся после первого запуска
        }
      });
    },
    {
      // rootMargin: "200px" — запускать чуть раньше, чем блок появится
      rootMargin: options.rootMargin || "0px",
      threshold: 0,
    },
  );

  observer.observe(element);

  // Если блок уже виден при загрузке — запускаем сразу
  const rect = element.getBoundingClientRect();
  const isAlreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
  if (isAlreadyVisible) {
    initialized = true;
    initFn();
    observer.disconnect();
  }
}
