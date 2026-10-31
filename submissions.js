(() => {
  const $ = id => document.getElementById(id);
  const STORAGE_KEY = 'apss-language';
  let language = localStorage.getItem(STORAGE_KEY) || 'fa';
  let client = null, user = null, lastSubmissions = [];
  const words = {
    fa: {
      setup:'اتصال Supabase تنظیم نشده است. فایل supabase-config.js را بررسی کنید.',
      noClient:'کتابخانه Supabase بارگذاری نشد؛ اتصال اینترنت را بررسی کنید.',
      needLogin:'برای ارسال اثر ابتدا وارد حساب کاربری شوید.',
      loadError:'دریافت آثار با خطا روبه‌رو شد.', empty:'هنوز اثری ثبت نکرده‌اید.',
      uploading:'در حال بارگذاری فایل‌ها و ثبت اثر…', success:'اثر شما با موفقیت ثبت شد.',
      failed:'ثبت اثر ناموفق بود: ', invalid:'هر دو فایل باید PDF، PNG، DOC یا DOCX و حداکثر ۱۰ مگابایت باشند.',
      badTitle:'عنوان، نام نویسندگان و محور علمی را کامل کنید.',
      badKeywords:'لطفاً بین ۳ تا ۷ کلیدواژه وارد کنید. کلیدواژه‌ها را با ویرگول یا در خط جداگانه بنویسید.',
      status:{submitted:'ثبت‌شده',under_review:'در حال بررسی',revision_requested:'نیازمند اصلاح',accepted:'پذیرفته‌شده',rejected:'ردشده'},
      logout:'خروج انجام شد.', keywords:'کلیدواژه‌ها: '
    },
    en: {
      setup:'Supabase is not configured. Check supabase-config.js.',
      noClient:'The Supabase library did not load. Check your internet connection.',
      needLogin:'Please sign in before submitting your work.', loadError:'Could not load your submissions.',
      empty:'You have not submitted any work yet.', uploading:'Uploading files and saving your submission…',
      success:'Your submission was saved successfully.', failed:'Submission failed: ',
      invalid:'Both files must be PDF, PNG, DOC, or DOCX and no larger than 10 MB.',
      badTitle:'Complete the title, authors, and scientific field.',
      badKeywords:'Enter 3–7 keywords, separated by commas or new lines.',
      status:{submitted:'Submitted',under_review:'Under review',revision_requested:'Revision requested',accepted:'Accepted',rejected:'Rejected'},
      logout:'You have signed out.', keywords:'Keywords: '
    }
  };

  function showStatus(msg, kind='success') {
    $('status').textContent = msg;
    $('status').className = `portal-status show ${kind}`;
  }
  function setLanguage(next) {
    language = next === 'en' ? 'en' : 'fa';
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.body.lang = language;
    document.body.dir = document.documentElement.dir;
    document.querySelectorAll('[data-en][data-fa]').forEach(el => {
      if (el.tagName === 'OPTION') el.textContent = el.dataset[language];
      else if (el.id !== 'submitButton') el.textContent = el.dataset[language];
    });
    $('languageToggle').textContent = language === 'fa' ? 'English' : 'فارسی';
    document.title = language === 'fa' ? 'ارسال آثار | سمینار علوم دارویی اردبیل' : 'Submit work | APSS 2026';
    renderList(lastSubmissions);
  }
  function fileValid(file) {
    if (!file || file.size > 10 * 1024 * 1024) return false;
    return ['pdf','png','doc','docx'].includes(file.name.split('.').pop().toLowerCase());
  }
  function uniqueName(file) {
    return `${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
  }
  function updateKeywordCount() {
    const count = parseKeywords($('keywords').value).length;
    $('keywordCount').textContent = language === 'fa' ? `${count} از ۷ کلیدواژه` : `${count} of 7 keywords`;
  }
  function parseKeywords(raw) {
    const seen = new Set();
    return raw.split(/[,،;؛\n]+/).map(s => s.trim()).filter(Boolean).filter(s => {
      const key = s.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  function renderList(rows) {
    const box = $('submissionList');
    if (!box) return;
    if (!rows.length) { box.innerHTML = `<p class="empty-list">${words[language].empty}</p>`; return; }
    box.replaceChildren();
    rows.forEach(row => {
      const item = document.createElement('article'); item.className = 'submission-item';
      const title = document.createElement('strong'); title.textContent = row.title;
      const meta = document.createElement('div'); meta.className = 'submission-meta';
      meta.textContent = `${row.authors} · ${row.scientific_field} · ${new Date(row.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-GB')}`;
      const status = document.createElement('span'); status.className = 'status-pill';
      status.textContent = words[language].status[row.status] || row.status;
      item.append(title, meta, status); box.appendChild(item);
    });
  }
  async function loadSubmissions() {
    const { data, error } = await client.from('submissions')
      .select('id,title,authors,scientific_field,status,created_at').order('created_at', {ascending:false});
    if (error) throw error;
    lastSubmissions = data || []; renderList(lastSubmissions);
  }
  function init() {
    const url = window.APSS_SUPABASE_URL, key = window.APSS_SUPABASE_PUBLISHABLE_KEY;
    if (!url || url.includes('PASTE_YOUR_') || !key || key.includes('PASTE_YOUR_')) {
      showStatus(words[language].setup, 'error'); $('submissionForm').classList.add('hidden'); return;
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      showStatus(words[language].noClient, 'error'); return;
    }
    client = window.supabase.createClient(url, key);
    client.auth.getSession().then(async ({data,error}) => {
      if (error) throw error;
      user = data.session?.user;
      if (!user) {
        showStatus(words[language].needLogin, 'error'); $('submissionForm').classList.add('hidden');
        $('signedInInfo').innerHTML = language === 'fa' ? 'برای ورود یا ثبت‌نام <a href="auth.html?mode=login">اینجا کلیک کنید</a>.' : 'Please <a href="auth.html?mode=login">sign in or register here</a>.';
        $('submissionList').replaceChildren(); return;
      }
      $('signedInInfo').textContent = (language === 'fa' ? 'واردشده با ایمیل: ' : 'Signed in as: ') + (user.email || '');
      await loadSubmissions();
    }).catch(e => showStatus(words[language].loadError + ' ' + (e.message || ''), 'error'));

    $('submissionForm').addEventListener('submit', async ev => {
      ev.preventDefault();
      if (!user) { showStatus(words[language].needLogin, 'error'); return; }
      const title = $('title').value.trim(), authors = $('authors').value.trim(), field = $('field').value;
      const abstractFile = $('abstractFile').files[0], posterFile = $('posterFile').files[0];
      const keywords = parseKeywords($('keywords').value);
      if (!title || !authors || !field) { showStatus(words[language].badTitle, 'error'); return; }
      if (keywords.length < 3 || keywords.length > 7) { showStatus(words[language].badKeywords, 'error'); $('keywords').focus(); return; }
      if (!fileValid(abstractFile) || !fileValid(posterFile)) { showStatus(words[language].invalid, 'error'); return; }

      const btn = $('submitButton'); btn.disabled = true; showStatus(words[language].uploading);
      const submissionId = crypto.randomUUID();
      const base = `${user.id}/submissions/${submissionId}`;
      const abstractPath = `${base}/abstract-${uniqueName(abstractFile)}`;
      const posterPath = `${base}/poster-${uniqueName(posterFile)}`;
      const keywordsPath = `${base}/keywords.txt`;
      const uploaded = [];
      try {
        for (const [file, path] of [[abstractFile, abstractPath], [posterFile, posterPath]]) {
          const { error } = await client.storage.from('apss-documents').upload(path, file, {contentType:file.type || undefined, upsert:false});
          if (error) throw error;
          uploaded.push(path);
        }
        const keywordText = [
          'APSS 9 — Submission keywords',
          `Title: ${title}`,
          `Authors: ${authors}`,
          '',
          ...keywords.map((keyword, i) => `${i + 1}. ${keyword}`),
          ''
        ].join('\n');
        const keywordBlob = new Blob(['\uFEFF', keywordText], {type:'text/plain;charset=utf-8'});
        const { error: keywordError } = await client.storage.from('apss-documents').upload(keywordsPath, keywordBlob, {contentType:'text/plain', upsert:false});
        if (keywordError) throw keywordError;
        uploaded.push(keywordsPath);

        const { error: insertError } = await client.from('submissions').insert({
          id: submissionId, user_id:user.id, title, authors, scientific_field:field,
          abstract_file_path:abstractPath, poster_file_path:posterPath, keywords_file_path:keywordsPath
        });
        if (insertError) throw insertError;
        $('submissionForm').reset(); await loadSubmissions(); showStatus(words[language].success);
      } catch (e) {
        if (uploaded.length) await client.storage.from('apss-documents').remove(uploaded).catch(() => {});
        showStatus(words[language].failed + (e.message || 'Unknown error'), 'error');
      } finally { btn.disabled = false; }
    });
    $('signOutButton').addEventListener('click', async () => { await client.auth.signOut(); window.location.href = 'auth.html?mode=login'; });
  }
  $('languageToggle').addEventListener('click', () => setLanguage(language === 'fa' ? 'en' : 'fa'));
  $('keywords').addEventListener('input', updateKeywordCount);
  setLanguage(language); updateKeywordCount(); init();
})();
