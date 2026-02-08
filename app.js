/* =========================================================
   Debug overlay helpers (mobile-friendly)
   ========================================================= */
// const dbgEl = () => document.getElementById("debug");
// function dbg(...args) {
//   const el = dbgEl();
//   if (!el) return;
//   el.textContent =
//     `[${new Date().toLocaleTimeString()}] ${args.join(" ")}\n` + el.textContent;
// }
// window.addEventListener("error", (e) => dbg("JS ERROR:", e.message));
// window.addEventListener("unhandledrejection", (e) =>
//   dbg("PROMISE ERROR:", String(e.reason))
// );

// 잘 될 때는 아래 살리고, 디버그창 살리려면 위 주석 해제
function dbg() {}

/* =========================================================
   Data
   ========================================================= */
const vowelEntries = [
  { key: "a", label: "ㅏ" },
  { key: "ya", label: "ㅑ" },
  { key: "eo", label: "ㅓ" },
  { key: "yeo", label: "ㅕ" },
  { key: "o", label: "ㅗ" },
  { key: "yo", label: "ㅛ" },
  { key: "u", label: "ㅜ" },
  { key: "yu", label: "ㅠ" },
  { key: "eu", label: "ㅡ" },
  { key: "i", label: "ㅣ" },
  { key: "ae", label: "ㅐ" },
  { key: "e", label: "ㅔ" },
  { key: "wa", label: "ㅘ" },
  { key: "wae", label: "ㅙ" },
  { key: "oe", label: "ㅚ" },
  { key: "wo", label: "ㅝ" },
  { key: "we", label: "ㅞ" },
  { key: "wi", label: "ㅟ" },
  { key: "ui", label: "ㅢ" },
];

const level2Syllables = [
  "가", "나", "다", "라", "마", "바", "사", "아", "자", "차",
  "카", "타", "파", "하",
  "까", "따", "빠", "싸", "짜",
];

const level2Entries = level2Syllables.map((label) => ({ key: label, label }));

const level3Triads = [
  ["자다", "짜다", "차다"],
  ["바지다", "빠지다", "파지다"],
  ["가다", "까다", "카다"],
  ["다다", "따다", "타다"],
];

const level3Pairs = [
  ["사다", "싸다"],
];

const level3MeaningWords = [
  "나무",
  "바다",
  "사과",
  "우유",
  "아기",
  "나라",
  "다리",
  "바나나",
  "고기",
  "모자",
];

const voicePacks = {
  ko: {
    // 반드시 ./ 로 시작 (상대경로 꼬임 방지)
    basePath: "./audio/ko/vowels",
    files: {
      a: "a.m4a",
      ya: "ya.m4a",
      eo: "eo.m4a",
      yeo: "yeo.m4a",
      o: "o.m4a",
      yo: "yo.m4a",
      u: "u.m4a",
      yu: "yu.m4a",
      eu: "eu.m4a",
      i: "i.m4a",
      ae: "ae.m4a",
      e: "e.m4a",
      wa: "wa.m4a",
      // 중요: 오타 수정 (wae는 wae.m4a)
      wae: "wae.m4a",
      oe: "oe.m4a",
      wo: "wo.m4a",
      we: "we.m4a",
      wi: "wi.m4a",
      ui: "ui.m4a",
    },
  },
};

let activePack = "ko";

/* =========================================================
   State
   ========================================================= */
let choices = [];
let replayBtn = null;
let levelTabs = [];
let titleEl = null;

let correctKey = "";
let isLocked = false;
let isTransitioning = false;
let currentLevel = 1;
let streak = 0;
let lastLevel3SetKey = "";

// 모바일에서 자동재생 정책 회피:
// 사용자가 한번이라도 터치/클릭하면 그때부터 자동재생 허용으로 간주
let userInteracted = false;

const coarsePointerQuery = window.matchMedia
  ? window.matchMedia("(pointer: coarse), (hover: none)")
  : null;

/* =========================================================
   Utils
   ========================================================= */
function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function makeEntries(labels) {
  return labels.map((label) => ({ key: label, label }));
}

function pickDifferent(getItem, isSame, limit = 8) {
  let next = getItem();
  let tries = 0;
  while (isSame(next) && tries < limit) {
    next = getItem();
    tries += 1;
  }
  return next;
}

function buildLevel1Round() {
  const [correct, wrong1, wrong2] = shuffle(vowelEntries).slice(0, 3);
  const options = shuffle([correct, wrong1, wrong2]);
  return { options, correctKey: correct.key };
}

function buildLevel2Round() {
  const [correct, wrong1, wrong2] = shuffle(level2Entries).slice(0, 3);
  const options = shuffle([correct, wrong1, wrong2]);
  return { options, correctKey: correct.key };
}

function buildLevel3Round() {
  const useTriad = Math.random() < 0.6;

  if (useTriad) {
    const triad = pickDifferent(
      () => level3Triads[Math.floor(Math.random() * level3Triads.length)],
      (next) => `triad:${next.join("|")}` === lastLevel3SetKey
    );
    const correctLabel = triad[Math.floor(Math.random() * triad.length)];
    const options = shuffle(makeEntries(triad));
    return {
      options,
      correctKey: correctLabel,
      setKey: `triad:${triad.join("|")}`,
    };
  }

  const pair = level3Pairs[Math.floor(Math.random() * level3Pairs.length)];
  const meaning = pickDifferent(
    () => level3MeaningWords[Math.floor(Math.random() * level3MeaningWords.length)],
    (next) => `pair:${pair.join("|")}|m:${next}` === lastLevel3SetKey
  );
  const correctLabel = pair[Math.floor(Math.random() * pair.length)];
  const options = shuffle(makeEntries([pair[0], pair[1], meaning]));
  return {
    options,
    correctKey: correctLabel,
    setKey: `pair:${pair.join("|")}|m:${meaning}`,
  };
}

function getRoundByLevel(level) {
  if (level === 2) return buildLevel2Round();
  if (level === 3) return buildLevel3Round();
  return buildLevel1Round();
}

function getAudioUrl(key) {
  const pack = voicePacks[activePack];
  if (!pack) return null;
  const filename = pack.files[key];
  if (!filename) return null;
  return `${pack.basePath}/${filename}`;
}

/* =========================================================
   Audio (single player + stop previous)
   ========================================================= */
let player = null;
function ensurePlayer() {
  if (!player) {
    player = new Audio();
    player.preload = "auto";
    // iOS 대응 속성 (안드로이드에도 무해)
    player.playsInline = true;
  }
  return player;
}

function stopAudio() {
  if (!player) return;
  try {
    player.pause();
    player.currentTime = 0;
  } catch (_) {}
}

function playVowel(key, { force = false, waitEnd = false } = {}) {
  return new Promise((resolve) => {
    const src = getAudioUrl(key);
    if (!src) {
      dbg("audio missing for key:", key);
      resolve(false);
      return;
    }

    // 자동재생은 첫 터치 전에는 막힐 수 있음
    if (!userInteracted && !force) {
      dbg("autoplay blocked until user gesture. key:", key);
      resolve(false);
      return;
    }

    const a = ensurePlayer();
    let resolved = false;
    const finish = (ok) => {
      if (resolved) return;
      resolved = true;
      resolve(ok);
    };

    stopAudio();
    a.src = src;

    a.onended = () => finish(true);
    a.onerror = () => {
      dbg("audio error:", src);
      finish(false);
    };

    a.play()
      .then(() => {
        dbg("audio playing:", src);
        if (!waitEnd) finish(true);
      })
      .catch(() => {
        dbg("audio play rejected (policy). src:", src);
        finish(false);
      });
  });
}

/* =========================================================
   Focus / Tap highlight mitigation (mobile)
   ========================================================= */
function applyMobileTabIndex() {
  const isMobile = coarsePointerQuery && coarsePointerQuery.matches;
  const value = isMobile ? "-1" : null;

  choices.forEach((btn) => {
    if (!btn) return;
    if (value) btn.setAttribute("tabindex", value);
    else btn.removeAttribute("tabindex");
  });

  if (replayBtn) {
    if (value) replayBtn.setAttribute("tabindex", value);
    else replayBtn.removeAttribute("tabindex");
  }
}

function blurAllFocus() {
  try {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
  } catch (_) {}

  choices.forEach((btn) => {
    try {
      if (btn && typeof btn.blur === "function") btn.blur();
    } catch (_) {}
  });

  try {
    if (replayBtn && typeof replayBtn.blur === "function") replayBtn.blur();
  } catch (_) {}
}

function afterRenderBlur() {
  blurAllFocus();
  requestAnimationFrame(() => blurAllFocus());
  setTimeout(() => blurAllFocus(), 30);
}

/* =========================================================
   UI helpers
   ========================================================= */
function clearFeedback() {
  choices.forEach((btn) => {
    if (!btn) return;
    btn.classList.remove("good", "bad", "active", "selected", "correct", "wrong");
  });
}

function renderChoices(entries3) {
  entries3.forEach((entry, idx) => {
    const btn = choices[idx];
    if (!btn) return;
    btn.textContent = entry.label;
    btn.dataset.key = entry.key;
  });

  dbg(
    "rendered:",
    choices.map((b) => b.textContent || "(empty)").join(" ")
  );
}

/* =========================================================
   Round logic
   ========================================================= */
function pickRound() {
  isLocked = true;
  isTransitioning = false;

  if (choices.length !== 3) {
    dbg("init broken: choices length =", String(choices.length));
    return;
  }

  clearFeedback();

  const round = getRoundByLevel(currentLevel);
  correctKey = round.correctKey;
  if (currentLevel === 3 && round.setKey) {
    lastLevel3SetKey = round.setKey;
  }

  renderChoices(round.options);
  applyMobileTabIndex();
  afterRenderBlur();

  // 첫 사용자 제스처 전에는 자동재생하지 않음(모바일 정책)
  playVowel(correctKey).finally(() => {
    isLocked = false;
  });
}

function handleChoice(btn) {
  const picked = btn?.dataset?.key;
  if (!picked) return;

  if (isTransitioning) return;
  userInteracted = true;

  // 잠긴 상태에서 오답 누르면 짧게 오답만 들려주기
  if (isLocked && picked !== correctKey) {
    btn.classList.add("bad");
    playVowel(picked, { force: true });
    setTimeout(() => btn.classList.remove("bad"), 350);
    streak = 0;
    return;
  }

  // 여기부터는 "판정" 들어감
  isLocked = true;

  if (picked === correctKey) {
    btn.classList.add("good");
    isTransitioning = true;
    streak += 1;

    // 정답 음성을 끝까지 재생하고 나서 다음 라운드
    playVowel(correctKey, { force: true, waitEnd: true }).finally(() => {
      setTimeout(() => {
        if (streak >= 10) {
          streak = 0;
          if (currentLevel < 3) {
            setLevel(currentLevel + 1);
            return;
          }
        }
        pickRound();
      }, 600);
    });

    return;
  }

  // 오답 처리
  btn.classList.add("bad");
  playVowel(picked, { force: true });
  setTimeout(() => {
    btn.classList.remove("bad");
    isLocked = false;
    streak = 0;
  }, 350);
}


/* =========================================================
   Event binding (click + pointerup, safe)
   ========================================================= */
function bindTap(el, handler) {
  if (!el) return;

  const wrapped = (e) => {
    // iOS/Android에서 중복 트리거 방지
    e?.preventDefault?.();
    e?.stopPropagation?.();

    // 사용자 제스처 플래그
    userInteracted = true;

    handler(e);
  };

  // pointerup 우선, click도 함께 (기기별 안정성)
  el.addEventListener("pointerup", wrapped, { passive: false });
  el.addEventListener("click", wrapped, { passive: false });
}

/* =========================================================
   Init
   ========================================================= */
function init() {
  dbg("boot ok");

  choices = Array.from(document.querySelectorAll(".choiceBtn"));
  replayBtn = document.getElementById("replayBtn");
  levelTabs = Array.from(document.querySelectorAll(".level-tab"));
  titleEl = document.querySelector(".brand h1");

  dbg("choices:", String(choices.length), "replayBtn:", replayBtn ? "ok" : "missing");

  if (choices.length !== 3) {
    dbg("INIT ERROR: expected 3 .choiceBtn, got", String(choices.length));
    return;
  }
  if (!replayBtn) {
    dbg("INIT ERROR: missing #replayBtn");
    return;
  }

  if (levelTabs.length === 0) {
    dbg("INIT ERROR: missing .level-tab");
    return;
  }

  levelTabs.forEach((tab) => {
    bindTap(tab, () => setLevel(tab.dataset.level));
  });

  // replay: 항상 현재 correctKey 재생
  bindTap(replayBtn, () => {
    dbg("replay tapped. correctKey:", correctKey || "(empty)");
    if (!correctKey) {
      pickRound();
      return;
    }
    playVowel(correctKey, { force: true });
  });

  // choices
  choices.forEach((btn) => {
    bindTap(btn, () => handleChoice(btn));
  });

  // 첫 터치로 userInteracted 세팅 (어디를 눌러도)
  document.addEventListener(
    "pointerdown",
    () => {
      if (!userInteracted) dbg("user gesture unlocked");
      userInteracted = true;
    },
    { once: true }
  );

  applyMobileTabIndex();
  setLevel(1);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* =========================================================
   Level UI
   ========================================================= */
function setLevel(nextLevel) {
  const levelNum = Number(nextLevel);
  if (![1, 2, 3].includes(levelNum)) return;
  currentLevel = levelNum;
  streak = 0;

  levelTabs.forEach((tab) => {
    const tabLevel = Number(tab.dataset.level);
    if (tabLevel === currentLevel) tab.classList.add("is-active");
    else tab.classList.remove("is-active");
  });

  if (titleEl) {
    titleEl.textContent = `Empareja vocales Nivel ${currentLevel}`;
  }

  pickRound();
}
