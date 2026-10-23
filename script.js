(() => {
  const body = document.body;
  const languageToggle = document.getElementById("languageToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  let currentLanguage = "en";

  function setLanguage(language) {
    currentLanguage = language;
    body.lang = language;
    body.dir = language === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = body.dir;
    document.querySelectorAll("[data-en][data-fa]").forEach((element) => {
      element.innerHTML = element.dataset[language];
    });
    languageToggle.textContent = language === "en" ? "فارسی" : "English";
    languageToggle.setAttribute("aria-label", language === "en" ? "Switch to Persian" : "Switch to English");
    document.title = language === "en"
      ? "APSS 2026 | Ardabil Pharmaceutical Sciences Seminar"
      : "APSS ۱۴۰۵ | نهمین سمینار سالیانه علوم دارویی اردبیل";
  }

  languageToggle.addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "fa" : "en");
  });

  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuToggle.textContent = open ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });

  setLanguage("en");
})();
