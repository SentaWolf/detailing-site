import "./scss/main.scss";
import { lazyInit } from "./js/lazyInit.js";

import {
  initHeroAnimation,
  initHeroAnchorScroll,
  initHeroParallax,
  animateHeroLinesOnLoad,
} from "./js/hero.js";
import { initHeaderMenuScroll } from "./js/header.js";

import {
  initTextCarousel,
  initAdvantagesSlider,
  initAmbientBubbles,
  initAdvantagesPopup,
  initAdvantagesTextClamp,
} from "./js/advantages.js";

import {
  initPortfolioAmbientLight,
  initPortfolioBeforeAfter,
  initPortfolioSlider,
  initPortfolioPopup,
} from "./js/portfolio.js";

import { initServicesCatalog } from "./js/services.js";

import { initReviewsSlider } from "./js/reviews.js";

import { initContactsMap } from "./js/contacts-map.js";

import { initContactForm } from "./js/contact-form.js";

import { initGallerySlider } from "./js/gallery.js";

import { animateContactsLinesWave } from "./js/contacts.js";

import {
  initEqualizer,
  contactsTemplate,
  reviewsTemplate,
  servicesTemplate,
  galleryTemplate,
} from "./js/animations.js";

// === Hero запускаем сразу ===
initHeroAnimation();
initHeroAnchorScroll();
initHeroParallax();
animateHeroLinesOnLoad();
initHeaderMenuScroll();

// Преимущества
lazyInit(
  "#advantagesSection",
  () => {
    initAdvantagesTextClamp();
    initAmbientBubbles();
    initAdvantagesPopup();
  },
  { rootMargin: "200px" },
);
initTextCarousel();
initAdvantagesSlider();

// Портфолио
lazyInit(
  "#portfolioSection",
  () => {
    initPortfolioAmbientLight();
    initPortfolioPopup();
  },
  { rootMargin: "200px" },
);
initPortfolioBeforeAfter();
initPortfolioSlider();

// Услуги
initServicesCatalog();

// Отзывы
initReviewsSlider();

initGallerySlider();

// Контакты
lazyInit(
  "#contactsFormSection",
  () => {
    initContactForm();
    animateContactsLinesWave();
  },
  { rootMargin: "800px" },
);

// Карта
lazyInit(
  "#contactsMapSection",
  () => {
    initContactsMap();
  },
  { rootMargin: "200px" },
);

// Равнозеры — каждый лениво
lazyInit(
  "#contactsEqualizerAmbient",
  () => {
    initEqualizer(
      "contactsEqualizerAmbient",
      "contactsEqualizerTrack",
      contactsTemplate,
    );
  },
  { rootMargin: "200px" },
);
lazyInit(
  "#reviewsEqualizerAmbient",
  () => {
    initEqualizer(
      "reviewsEqualizerAmbient",
      "reviewsEqualizerTrack",
      reviewsTemplate,
    );
  },
  { rootMargin: "200px" },
);
lazyInit(
  "#servicesEqualizerAmbient",
  () => {
    initEqualizer(
      "servicesEqualizerAmbient",
      "servicesEqualizerTrack",
      servicesTemplate,
    );
  },
  { rootMargin: "200px" },
);
lazyInit(
  "#galleryEqualizerAmbient",
  () => {
    initEqualizer(
      "galleryEqualizerAmbient",
      "galleryEqualizerTrack",
      galleryTemplate,
    );
  },
  { rootMargin: "200px" },
);
