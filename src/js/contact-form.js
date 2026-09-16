import IMask from "imask";

export function initContactForm() {
  const form = document.getElementById("callbackForm");
  if (!form) return;

  const submitBtn = form.querySelector(".contacts__submit-btn");
  const originalText = submitBtn.textContent;
  const phoneInput = document.getElementById("userPhone");

  const popup = document.getElementById("formPopup");
  const popupMessage = document.getElementById("formPopupMessage");
  const popupText = document.getElementById("formPopupText");
  const popupCloseBtn = popup ? popup.querySelector(".popup__close") : null;
  const popupOverlay = popup ? popup.querySelector(".popup__overlay") : null;

  const phoneMask = IMask(phoneInput, {
    mask: "+7(000)-000-00-00",
  });

  function openPopup(message, text, isSuccess) {
    if (!popup || !popupMessage || !popupText) return;

    popupMessage.textContent = message;
    popupText.textContent = text || "";

    popupMessage.classList.toggle("form-popup__message--success", isSuccess);
    popupMessage.classList.toggle("form-popup__message--error", !isSuccess);

    popup.classList.add("is-open");
    popup.setAttribute("aria-hidden", "false");

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (popupCloseBtn) popupCloseBtn.focus();
  }

  function closePopup() {
    if (!popup) return;
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  if (popupCloseBtn) popupCloseBtn.addEventListener("click", closePopup);
  if (popupOverlay) popupOverlay.addEventListener("click", closePopup);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup && popup.classList.contains("is-open")) {
      closePopup();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const privacyCheckbox = form.querySelector('input[name="privacy"]');
    if (privacyCheckbox && !privacyCheckbox.checked) {
      privacyCheckbox.reportValidity();
      return;
    }

    if (phoneMask.unmaskedValue.length !== 10) {
      openPopup("Ошибка", "Введите номер телефона полностью", false);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";

    try {
      const formData = new FormData(form);
      const response = await fetch("/contact-form", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        phoneMask.value = "";
        openPopup(
          "Спасибо!",
          result.message || "Мы скоро свяжемся с вами.",
          true,
        );
      } else {
        openPopup("Ошибка", result.message || "Что-то пошло не так.", false);
      }
    } catch (error) {
      openPopup("Ошибка", "Ошибка соединения. Попробуйте позже.", false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
