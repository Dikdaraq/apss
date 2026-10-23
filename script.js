(() => {
  const body = document.body;
  const languageToggle = document.getElementById("languageToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const STORAGE_KEY = "apss-language";
  let currentLanguage = localStorage.getItem(STORAGE_KEY) || "fa";

  function setLanguage(language) {
    currentLanguage = language === "en" ? "en" : "fa";
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    const direction = currentLanguage === "fa" ? "rtl" : "ltr";
    body.lang = currentLanguage;
    body.dir = direction;
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = direction;
    document.querySelectorAll("[data-en][data-fa]").forEach((element) => {
      element.innerHTML = element.dataset[currentLanguage];
    });
    languageToggle.textContent = currentLanguage === "fa" ? "English" : "فارسی";
    languageToggle.setAttribute("aria-label", currentLanguage === "fa" ? "Switch to English" : "تغییر زبان به فارسی");
    document.title = currentLanguage === "en"
      ? "APSS 2026 | Ardabil Pharmaceutical Sciences Seminar"
      : "APSS ۱۴۰۵ | نهمین سمینار سالیانه علوم دارویی اردبیل";
  }

  languageToggle.addEventListener("click", () => setLanguage(currentLanguage === "en" ? "fa" : "en"));
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menuToggle.textContent = open ? "×" : "☰";
  });
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  }));
  setLanguage(currentLanguage);
})();
