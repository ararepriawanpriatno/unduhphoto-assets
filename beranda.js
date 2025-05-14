
// ======= LOGIN MODAL + QR POLLING =======
let pollingInterval, checkingStatus = false;

function openLoginModal() {
  console.log('▶ openLoginModal() - reset status');
  fetch(window.location.origin + '/status_reset.php')
    .then(() => {
      const modal = document.getElementById('loginModal');
      modal.style.display = 'flex';
      document.getElementById('loginFormWrapper').style.display = 'block';
      document.getElementById('registerFormContainer').style.display = 'none';
      checkingStatus = false;
      startPollingStatus();
    })
    .catch(err => console.error('Gagal reset status:', err));
}

function closeLoginModal() {
  console.log('▶ closeLoginModal()');
  document.getElementById('loginModal').style.display = 'none';
  stopPollingStatus();
}

function toggleForms() {
  document.getElementById('loginFormWrapper').style.display = 'none';
  document.getElementById('registerFormContainer').style.display = 'block';
}

function resetToLogin() {
  document.getElementById('loginFormWrapper').style.display = 'block';
  document.getElementById('registerFormContainer').style.display = 'none';
}

function startPollingStatus() {
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(window.location.origin + '/status_cek.php');
      const status = (await res.text()).trim();
      console.log('status_cek:', status);
      if (status === 'daftar' && !checkingStatus) {
        checkingStatus = true;
        document.getElementById('waitingMessage').innerText = 'QR Terdeteksi, membuka formulir daftar…';
        setTimeout(toggleForms, 1000);
      }
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, 2000);
}

function stopPollingStatus() {
  clearInterval(pollingInterval);
}

// Tutup modal saat klik di luar
window.addEventListener('click', e => {
  if (e.target.id === 'loginModal') closeLoginModal();
});

// ======= AVATAR PREVIEW =======
document.getElementById('id_kontributor').addEventListener('input', function() {
  const userId = this.value.trim();
  const avatar = document.getElementById("avatarPreview");

  if (userId.length < 3) {
    avatar.src = "img/default-avatar.png";
    return;
  }

  fetch("get_avatar.php?user_id=" + encodeURIComponent(userId))
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        avatar.src = "uploads/avatar/" + data.avatar;
      } else {
        avatar.src = "img/default-avatar.png";
      }
    })
    .catch(() => {
      avatar.src = "img/default-avatar.png";
    });
});

// ======= AUTOCOMPLETE SEARCH =======
(function() {
  const keywords = [
    "orang", "binatang", "pemandangan", "makro", "street", "candid",
    "bunga", "langit", "air terjun", "matahari", "hewan", "alam"
  ];

  const input = document.getElementById("searchInput");
  const list = document.getElementById("autocompleteList");
  let currentFocus = -1;

  function renderList(filtered) {
    list.innerHTML = "";
    filtered.forEach(w => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-group-item list-group-item-action";
      btn.textContent = w; // akan diganti oleh translatePage
      btn.setAttribute("data-i18n", w);
      btn.onclick = () => {
        input.value = btn.textContent; // ← ambil teks yang sudah diterjemahkan
        list.innerHTML = "";
      };
      list.appendChild(btn);
    });

    if (typeof translatePage === "function") translatePage();
  }

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const filtered = q === "" ? keywords : keywords.filter(w => w.startsWith(q));
    currentFocus = -1;
    renderList(filtered);
  });

  input.addEventListener("keydown", e => {
    const items = list.querySelectorAll("button");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      updateActive(items);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      updateActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) {
        items[currentFocus].click();
      }
    }
  });

  function updateActive(items) {
    items.forEach(btn => btn.classList.remove("active"));
    if (currentFocus >= 0 && currentFocus < items.length) {
      items[currentFocus].classList.add("active");
      items[currentFocus].scrollIntoView({ block: "nearest" });
    }
  }

  input.addEventListener("focus", () => {
    renderList(keywords); // Tampilkan semua keyword saat fokus
  });

  document.addEventListener("click", ev => {
    if (!input.contains(ev.target) && !list.contains(ev.target)) list.innerHTML = "";
  });
})();








// Blok klik kanan hanya pada gambar
document.addEventListener('contextmenu', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

document.addEventListener('contextmenu', function(e) {
  e.preventDefault(); // Blok klik kanan
});

document.addEventListener('keydown', function(e) {
  if (
    e.key === 'F12' ||                             // F12
    (e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
    (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
    (e.ctrlKey && e.key === 'U')                  // Ctrl+U (view source)
  ) {
    e.preventDefault();
  }
});

setInterval(function () {
    fetch("status_cek.php")
        .then(response => response.text())
        .then(status => {
            if (status.trim() === "daftar") {
                // Reset status supaya tidak berulang
                fetch("status_reset.php"); 

                // Tampilkan form pendaftaran atau redirect
                window.location.href = "daftar.php";
            }
        });
}, 3000); // cek tiap 3 detik

    window.onload = function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('showLogin') === '1') {
            openLoginModal();
        }
    };

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const idValue = params.get("id_kontributor");
    if (idValue) {
        const idInput = document.getElementById("id_kontributor");
        if (idInput) {
            idInput.value = idValue;
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const showLogin = params.get('showLogin');
  const idKontributor = params.get('id_kontributor');

  if (showLogin === '1' && idKontributor) {
    const input = document.getElementById('id_kontributor');
    if (input) {
      input.value = idKontributor;
    }

    const modal = document.getElementById('loginModal');
    if (modal) {
      openLoginModal(); // Fungsi Anda sendiri untuk buka modal login
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const defaultLang = 'id';
  let fullLang = navigator.language || navigator.userLanguage || defaultLang;
  let shortLang = fullLang.slice(0, 2);

  const countryLangMap = {
    RU: 'ru', NL: 'nl', DE: 'de', FR: 'fr', ES: 'es', JP: 'ja',
    CN: 'zh', KR: 'ko', IN: 'hi', TH: 'th', VN: 'vi', TR: 'tr',
    PT: 'pt', IT: 'it', AR: 'ar', MY: 'ms', PL: 'pl', CZ: 'cs',
    RO: 'ro', HU: 'hu', ID: 'id', PH: 'tl', PK: 'ur', BD: 'bn',
    UA: 'uk', SE: 'sv', NO: 'no', FI: 'fi', GR: 'el', IL: 'he',
    IR: 'fa', ET: 'am', SA: 'ar', ZA: 'en', EG: 'ar', KE: 'sw',
    NG: 'en', CO: 'es', PE: 'es', CL: 'es', MX: 'es', CR: 'es',
    HN: 'es', DO: 'es', GT: 'es', PA: 'es', EC: 'es', VE: 'es',
    BO: 'es', PY: 'es', BR: 'pt', CA: 'fr', US: 'en', GB: 'en',
    AU: 'en', NZ: 'en', IE: 'en', SG: 'en', HK: 'zh', TW: 'zh',
    KH: 'km', LA: 'lo', MN: 'mn', IS: 'is', DK: 'da', BG: 'bg',
    SK: 'sk', LT: 'lt', LV: 'lv', EE: 'et', BY: 'be', MK: 'mk',
    RS: 'sr', BA: 'bs', ME: 'sr', HR: 'hr', SI: 'sl', GE: 'ka',
    AM: 'hy', AZ: 'az', TJ: 'tg', KY: 'ky', NE: 'ne', MZ: 'pt',
    ZM: 'en', ZW: 'en', AD: 'en', AE: 'en', AF: 'en', AG: 'en',
    AI: 'en', AL: 'en', AO: 'en', AQ: 'en', AS: 'en', AT: 'en',
    AW: 'en', AX: 'en', BB: 'en', BE: 'en', BF: 'en', BH: 'en',
    BI: 'en', BJ: 'en', BL: 'en', BM: 'en', BN: 'en', BQ: 'en',
    BS: 'en', BT: 'en', BV: 'en', BW: 'en', BZ: 'en', CC: 'en',
    CD: 'en', CF: 'en', CG: 'en', CH: 'en', CI: 'en', CK: 'en',
    CM: 'en', CU: 'en', CV: 'en', CW: 'en', CX: 'en', CY: 'en',
    DJ: 'en', DM: 'en', DZ: 'en', EH: 'en', ER: 'en', FJ: 'en',
    FK: 'en', FM: 'en', FO: 'en', GA: 'en', GD: 'en', GF: 'en',
    GG: 'en', GH: 'en', GI: 'en', GL: 'en', GM: 'en', GN: 'en',
    GP: 'en', GQ: 'en', GS: 'en', GU: 'en', GW: 'en', GY: 'en',
    HM: 'en', HT: 'en', IM: 'en', IO: 'en', IQ: 'en', JE: 'en',
    JM: 'en', JO: 'en', KI: 'en', KM: 'en', KN: 'en', KP: 'en',
    KW: 'en', KZ: 'en', LB: 'en', LC: 'en', LI: 'en', LK: 'en',
    LR: 'en', LS: 'en', LU: 'en', LY: 'en', MA: 'en', MC: 'en',
    MD: 'en', MF: 'en', MG: 'en', MH: 'en', ML: 'en', MM: 'en',
    MO: 'en', MP: 'en', MQ: 'en', MR: 'en', MS: 'en', MT: 'en',
    MU: 'en', MV: 'en', MW: 'en', NA: 'en', NC: 'en', NF: 'en',
    NI: 'es', NP: 'ne', NR: 'en', NU: 'en', OM: 'en', PF: 'en',
    PG: 'en', PM: 'en', PN: 'en', PR: 'es', PW: 'en', QA: 'en',
    RE: 'en', RW: 'en', SB: 'en', SC: 'en', SD: 'en', SH: 'en',
    SJ: 'en', SL: 'en', SM: 'en', SN: 'en', SO: 'en', SR: 'en',
    SS: 'en', ST: 'en', SV: 'es', SY: 'en', SZ: 'en', TC: 'en',
    TD: 'en', TF: 'en', TK: 'en', TL: 'en', TM: 'en', TN: 'en',
    TO: 'en', TT: 'en', TV: 'en', TZ: 'en', UG: 'en', UM: 'en',
    UY: 'es', UZ: 'en', VA: 'en', VC: 'en', VG: 'en', VI: 'en',
    VU: 'en', WF: 'en', WS: 'en', YE: 'en', YT: 'en'
  };

  // Deteksi lokasi negara pengguna dan sesuaikan shortLang jika perlu
  try {
    const geoRes = await fetch('https://ipapi.co/json/');
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const countryCode = geoData.country_code;
      if (!shortLang || shortLang === defaultLang) {
        shortLang = countryLangMap[countryCode] || 'en';
      }
    }
  } catch (geoErr) {
    console.warn('Gagal mendeteksi lokasi, pakai bahasa default:', geoErr);
  }

  // Ambil file terjemahan dari folder `locales/`
  let translations = {};
  try {
    const res = await fetch(`locales/${shortLang}.json`);
    if (!res.ok) {
      const fallbackRes = await fetch(`locales/${defaultLang}.json`);
      translations = await fallbackRes.json();
    } else {
      translations = await res.json();
    }
  } catch (err) {
    console.error('Gagal memuat file terjemahan:', err);
  }

  function getTranslation(key) {
    return translations[key] || key;
  }

  // Terjemahkan judul halaman
  document.title = getTranslation("title");

  // Terjemahkan elemen dengan data-i18n
 function getTranslation(key) {
  // Coba cari di objek translations
  if (translations[key]) return translations[key];

  // Fallback ke bahasa default (misal: 'en'), jika ada
  if (fallbackTranslations && fallbackTranslations[key]) {
    return fallbackTranslations[key];
  }

  // Jika tidak ada, bisa log atau kembalikan key itu sendiri
  return key;
}

// Pemanggil utama
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.getAttribute('data-i18n');
  const translation = getTranslation(key);
  if (translation) el.textContent = translation;
});


  // Terjemahkan placeholder input
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = getTranslation(key);
    if (translation) el.setAttribute('placeholder', translation);
  });

  // Autocomplete terjemahan kata kunci
  const keywords = [
    "orang", "binatang", "pemandangan", "makro", "street", "candid",
    "bunga", "langit", "air terjun", "matahari", "hewan", "alam"
  ];
  const translatedKeywords = keywords.map(key => getTranslation(key));

  const input = document.getElementById("searchInput");
  const list = document.getElementById("autocompleteList");
  let currentFocus = -1;

  function renderList(filtered) {
    list.innerHTML = "";
    filtered.forEach(w => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "list-group-item list-group-item-action";
      btn.textContent = w;
      btn.onclick = () => {
        input.value = btn.textContent;
        list.innerHTML = "";
      };
      list.appendChild(btn);
    });
  }

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    const filtered = q === "" ? translatedKeywords : translatedKeywords.filter(w => w.toLowerCase().startsWith(q));
    currentFocus = -1;
    renderList(filtered);
  });

  input.addEventListener("keydown", e => {
    const items = list.querySelectorAll("button");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      currentFocus++;
      if (currentFocus >= items.length) currentFocus = 0;
      updateActive(items);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      if (currentFocus < 0) currentFocus = items.length - 1;
      updateActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) {
        items[currentFocus].click();
      }
    }
  });

  function updateActive(items) {
    items.forEach(btn => btn.classList.remove("active"));
    if (currentFocus >= 0 && currentFocus < items.length) {
      items[currentFocus].classList.add("active");
      items[currentFocus].scrollIntoView({ block: "nearest" });
    }
  }

  input.addEventListener("focus", () => {
    renderList(translatedKeywords);
  });

  document.addEventListener("click", ev => {
    if (!input.contains(ev.target) && !list.contains(ev.target)) list.innerHTML = "";
  });

});
