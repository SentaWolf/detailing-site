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

import { initServicesCatalog } from "./js/services.js";

import { initReviewsSlider } from "./js/reviews.js";

import { initContactsMap } from "./js/contacts-map.js";

import { initEqualizer } from "./js/animations.js";

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
initReviewsSlider();
initContactsMap();
initEqualizer();
