import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

export function initHeaderMenuScroll() {
  const headerNav = document.querySelector(".header__nav");
  const logo = document.querySelector(".header__logo");

  const menuBtn = document.querySelector(".header__menu-trigger--opend");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeBtn = document.querySelector(".mobile-menu__close");

  if (!headerNav || !menuBtn || !mobileMenu) return;

  const mediaQuery = window.matchMedia("(max-width: 992px)");

  const closeMenu = () => {
    mobileMenu.classList.remove("is-open");
    menuBtn.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  menuBtn.addEventListener("click", () => {
    if (!mediaQuery.matches) return;

    const isOpen = mobileMenu.classList.toggle("is-open");
    menuBtn.classList.toggle("is-open");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  mediaQuery.addEventListener("change", (e) => {
    if (!e.matches) {
      closeMenu();
    }
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest(".nav-link, .nav-link--mobile");
    if (!link) return;

    const targetId = link.getAttribute("href");

    if (targetId && targetId.startsWith("#")) {
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      closeMenu();

      gsap.to(window, {
        duration: 0.8,
        scrollTo: {
          y: targetElement,
          offsetY: 24,
        },
        ease: "power1.inOut",
      });
    }
  });

  document.addEventListener("click", (e) => {
    const logoLink = e.target.closest(".header__logo");
    if (!logoLink) return;

    e.preventDefault();

    closeMenu();

    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: 0 },
      ease: "power1.inOut",
    });
  });

  const routeBtn = document.querySelector(".header__btn");
  const targetMapSection = document.getElementById("contactsMapSection");

  if (routeBtn && targetMapSection) {
    routeBtn.addEventListener("click", (e) => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        const mobileUrl = routeBtn.dataset.mobileHref;
        window.open(mobileUrl, "_blank", "noopener,noreferrer,nofollow");
      } else {
        closeMenu();

        gsap.to(window, {
          duration: 0.8,
          scrollTo: {
            y: targetMapSection,
            offsetY: 80,
          },
          ease: "power1.inOut",
        });
      }
    });
  }

  const stickyWrapper = document.querySelector(".header-sticky-wrapper");
  const heroSection = document.querySelector(".hero");

  if (stickyWrapper && heroSection) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: "bottom top",

      onEnter: () => {
        stickyWrapper.classList.add("is-sticky");
      },
      onLeaveBack: () => {
        stickyWrapper.classList.remove("is-sticky");
      },
    });
  }
}
