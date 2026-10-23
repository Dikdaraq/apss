(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("authForm"), status = $("status"), registerTab = $("registerTab"), loginTab = $("loginTab");
  const STORAGE_KEY = "apss-language";
  let language = localStorage.getItem(STORAGE_KEY) || "fa", mode = "register", client;
  const words = {
    fa: {register:"ثبت‌نام", login:"ورود", createTitle:"ایجاد حساب کاربری", loginTitle:"ورود به حساب کاربری", createIntro:"برای آماده‌سازی و ارسال چکیده و پوستر، با ایمیل خود ثبت‌نام کنید.", loginIntro:"با نشانی ایمیلی که هنگام ثبت‌نام استفاده کرده‌اید وارد شوید.", createButton:"ایجاد حساب", loginButton:"ورود", creating:"در حال ایجاد حساب…", signing:"در حال ورود…", needDetails:"نام و نام خانوادگی و نام دانشگاه یا مؤسسه را وارد کنید.", setup:"تنظیمات لازم است: نشانی پروژه Supabase و کلید publishable را در فایل supabase-config.js وارد کنید.", noClient:"کتابخانه Supabase بارگذاری نشد. اتصال اینترنت را بررسی و صفحه را دوباره بارگذاری کنید.", configError:"پیکربندی Supabase بارگذاری نشد. فایل supabase-config.js را بررسی کنید.", created:"حساب ساخته شد و وارد شدید. پروفایل شما آماده است.", verify:"ثبت‌نام انجام شد. ایمیل خود را بررسی کنید و پیش از ورود، پیوند تأیید را باز کنید.", verified:"پیوند تأیید ایمیل باز شده است. اگر ایمیل تأیید شده، اکنون می‌توانید وارد شوید.", signed:"ورود با موفقیت انجام شد. بخش ارسال آثار در مرحله بعد فعال می‌شود.", failed:"مشکلی رخ داد. لطفاً دوباره تلاش کنید."},
    en: {register:"Register", login:"Sign in", createTitle:"Create your account", loginTitle:"Sign in to your account", createIntro:"Register with your email to prepare your abstract and poster submission.", loginIntro:"Sign in with the email address you registered with.", createButton:"Create account", loginButton:"Sign in", creating:"Creating account…", signing:"Signing in…", needDetails:"Enter your full name and institution.", setup:"Setup required: add your Supabase Project URL and publishable key to supabase-config.js.", noClient:"The Supabase client could not load. Check your internet connection and reload this page.", configError:"Supabase configuration could not be loaded. Check supabase-config.js.", created:"Account created and signed in. Your profile is ready.", verify:"Registration started. Check your inbox and click the verification link before signing in.", verified:"Email verification link opened. You can now sign in if your email has been confirmed.", signed:"Signed in successfully. The submission dashboard is the next feature to be connected.", failed:"Something went wrong. Please try again."}
  };
  function showStatus(message, kind="success") { status.textContent=message; status.className=`auth-status show ${kind}`; }
  function clearStatus(){status.textContent="";status.className="auth-status";}
  function setLanguage(next) {
    language = next === "en" ? "en" : "fa"; localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang=language; document.documentElement.dir=language==="fa"?"rtl":"ltr"; document.body.lang=language; document.body.dir=document.documentElement.dir;
    document.querySelectorAll("[data-en][data-fa]").forEach(el=>el.innerHTML=el.dataset[language]);
    $("languageToggle").textContent=language==="fa"?"English":"فارسی";
    $("languageToggle").setAttribute("aria-label",language==="fa"?"Switch to English":"تغییر زبان به فارسی");
    document.title=language==="fa"?"ورود و ثبت‌نام | سمینار علوم دارویی اردبیل":"Sign in or register | APSS 2026";
    setMode(mode, false);
  }
  function setMode(nextMode, clear=true) {
    mode=nextMode; const registering=mode==="register", w=words[language];
    registerTab.classList.toggle("active",registering); loginTab.classList.toggle("active",!registering);
    registerTab.textContent=w.register; loginTab.textContent=w.login;
    $("pageTitle").textContent=registering?w.createTitle:w.loginTitle;
    $("pageIntro").textContent=registering?w.createIntro:w.loginIntro;
    $("nameWrap").classList.toggle("hidden",!registering); $("institutionWrap").classList.toggle("hidden",!registering);
    $("fullName").required=registering; $("institution").required=registering; $("password").autocomplete=registering?"new-password":"current-password";
    $("submitButton").textContent=registering?w.createButton:w.loginButton;
    $("fullName").placeholder=language==="fa"?"نام کامل شما":"Your full name";
    $("institution").placeholder=language==="fa"?"نام دانشگاه یا مؤسسه":"Your institution";
    $("password").placeholder=language==="fa"?"حداقل ۸ نویسه":"At least 8 characters";
    if(clear) clearStatus();
  }
  registerTab.addEventListener("click",()=>setMode("register")); loginTab.addEventListener("click",()=>setMode("login"));
  $("languageToggle").addEventListener("click",()=>setLanguage(language==="fa"?"en":"fa"));
  try {
    const url=window.APSS_SUPABASE_URL, key=window.APSS_SUPABASE_PUBLISHABLE_KEY, w=words[language];
    if(!url||url.includes("PASTE_YOUR_")||!key||key.includes("PASTE_YOUR_")){showStatus(w.setup,"error");form.querySelector("button[type=submit]").disabled=true;}
    else if(!window.supabase||typeof window.supabase.createClient!=="function"){showStatus(w.noClient,"error");form.querySelector("button[type=submit]").disabled=true;}
    else client=window.supabase.createClient(url,key);
  } catch(e){showStatus(words[language].configError,"error");form.querySelector("button[type=submit]").disabled=true;}
  const params=new URLSearchParams(window.location.search);
  if(params.get("verified")==="1") showStatus(words[language].verified);
  if(params.get("error_description")) showStatus(params.get("error_description"),"error");
  form.addEventListener("submit",async event=>{
    event.preventDefault(); if(!client)return; clearStatus(); const button=$("submitButton"), w=words[language];
    button.disabled=true; button.textContent=mode==="register"?w.creating:w.signing;
    const email=$("email").value.trim(), password=$("password").value;
    try {
      if(mode==="register") {
        const fullName=$("fullName").value.trim(), institution=$("institution").value.trim();
        if(!fullName||!institution) throw new Error(w.needDetails);
        const emailRedirectTo=`${window.location.origin}${window.location.pathname}`;
        const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo,data:{full_name:fullName,institution}}});
        if(error)throw error;
        if(data.session)showStatus(w.created);else{showStatus(w.verify);form.reset();}
      } else {const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;window.location.href="submissions.html";return;}
    } catch(error){showStatus(error.message||w.failed,"error");}
    finally{button.disabled=false;button.textContent=mode==="register"?words[language].createButton:words[language].loginButton;}
  });
  const requested=new URLSearchParams(window.location.search).get("mode");
  setLanguage(language); setMode(requested==="login"?"login":"register",false);
})();
