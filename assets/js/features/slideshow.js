/* Smart Ragunan Ride - shared automatic Fade slideshow */
(() => {
  "use strict";

  const initSlideshow = (container) => {
    const slides = Array.from(container.querySelectorAll(".srr-slide"));
    const dots = Array.from(container.querySelectorAll(".srr-slide-dots button"));
    if (slides.length < 2) return;

    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains("is-active")));
    let timer = null;
    const interval = 4500;

    const show = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === current);
        slide.setAttribute("aria-hidden", index === current ? "false" : "true");
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === current);
        dot.setAttribute("aria-current", index === current ? "true" : "false");
      });
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const start = () => {
      stop();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timer = window.setInterval(() => show(current + 1), interval);
      }
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        start();
      });
    });
    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", start);
    container.addEventListener("focusin", stop);
    container.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    show(current);
    start();
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-srr-slideshow]").forEach(initSlideshow);
  });
})();
