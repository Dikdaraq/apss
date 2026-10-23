(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("authForm");
  const status = $("status");
  const registerTab = $("registerTab");
  const loginTab = $("loginTab");
  let mode = "register";
  let client;

  function showStatus(message, kind = "success") {
    status.textContent = message;
    status.className = `auth-status show ${kind}`;
  }
  function clearStatus() { status.textContent = ""; status.className = "auth-status"; }
  function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === "register";
    registerTab.classList.toggle("active", registering);
    loginTab.classList.toggle("active", !registering);
    $("pageTitle").textContent = registering ? "Create your account" : "Sign in to your account";
    $("pageIntro").textContent = registering ? "Register with your email to prepare your abstract and poster submission." : "Sign in with the email address you registered with.";
    $("nameWrap").classList.toggle("hidden", !registering);
    $("institutionWrap").classList.toggle("hidden", !registering);
    $("fullName").required = registering;
    $("institution").required = registering;
    $("password").autocomplete = registering ? "new-password" : "current-password";
    $("submitButton").textContent = registering ? "Create account" : "Sign in";
    clearStatus();
  }

  registerTab.addEventListener("click", () => setMode("register"));
  loginTab.addEventListener("click", () => setMode("login"));

  try {
    const url = window.APSS_SUPABASE_URL;
    const key = window.APSS_SUPABASE_PUBLISHABLE_KEY;
    if (!url || url.includes("PASTE_YOUR_") || !key || key.includes("PASTE_YOUR_")) {
      showStatus("Setup required: add your Supabase Project URL and publishable key to supabase-config.js, then commit the file to GitHub Pages.", "error");
      form.querySelector("button[type=submit]").disabled = true;
      return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      showStatus("The Supabase client could not load. Check your internet connection and reload this page.", "error");
      form.querySelector("button[type=submit]").disabled = true;
      return;
    }
    client = window.supabase.createClient(url, key);
  } catch (error) {
    showStatus("Supabase configuration could not be loaded. Check supabase-config.js.", "error");
    form.querySelector("button[type=submit]").disabled = true;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("verified") === "1") showStatus("Email verification link opened. You can now sign in if your email has been confirmed.");
  if (params.get("error_description")) showStatus(params.get("error_description"), "error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();
    const button = $("submitButton");
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = mode === "register" ? "Creating account…" : "Signing in…";
    const email = $("email").value.trim();
    const password = $("password").value;
    try {
      if (mode === "register") {
        const fullName = $("fullName").value.trim();
        const institution = $("institution").value.trim();
        if (!fullName || !institution) throw new Error("Enter your full name and institution.");
        const emailRedirectTo = `${window.location.origin}${window.location.pathname}`;
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
            data: { full_name: fullName, institution }
          }
        });
        if (error) throw error;
        if (data.session) {
          showStatus("Account created and signed in. Your profile is ready.");
        } else {
          showStatus("Registration started. Check your inbox and click the verification link before signing in.");
          form.reset();
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showStatus("Signed in successfully. The submission dashboard is the next feature to be connected.");
      }
    } catch (error) {
      showStatus(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      button.disabled = false;
      button.textContent = originalText;
      button.textContent = mode === "register" ? "Create account" : "Sign in";
    }
  });
})();
