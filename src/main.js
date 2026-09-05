import "./scss/main.scss";

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
} from "./js/advantages.js";

import {
  initPortfolioAmbientLight,
  initPortfolioBeforeAfter,
  initPortfolioSlider,
} from "./js/portfolio.js";

import { initServicesCatalog, initServicesEqualizer } from "./js/services.js";

import { initReviewsEqualizer, initReviewsSlider } from "./js/reviews.js";

import { initContactsEqualizer, initContactsMap } from "./js/contacts.js";

initHeroAnimation();
initHeroAnchorScroll();
initHeroParallax();
animateHeroLinesOnLoad();
initHeaderMenuScroll();
initTextCarousel();
initAdvantagesSlider();
initAmbientBubbles();
initPortfolioAmbientLight();
initPortfolioBeforeAfter();
initPortfolioSlider();
initServicesCatalog();
initServicesEqualizer();
initReviewsEqualizer();
initReviewsSlider();
initContactsEqualizer();
initContactsMap();
