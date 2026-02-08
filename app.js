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
  { roman: "a", label: "ㅏ", kind: "vowel" },
  { roman: "ya", label: "ㅑ", kind: "vowel" },
  { roman: "eo", label: "ㅓ", kind: "vowel" },
  { roman: "yeo", label: "ㅕ", kind: "vowel" },
  { roman: "o", label: "ㅗ", kind: "vowel" },
  { roman: "yo", label: "ㅛ", kind: "vowel" },
  { roman: "u", label: "ㅜ", kind: "vowel" },
  { roman: "yu", label: "ㅠ", kind: "vowel" },
  { roman: "eu", label: "ㅡ", kind: "vowel" },
  { roman: "i", label: "ㅣ", kind: "vowel" },
  { roman: "ae", label: "ㅐ", kind: "vowel" },
  { roman: "e", label: "ㅔ", kind: "vowel" },
  { roman: "wa", label: "ㅘ", kind: "vowel" },
  { roman: "wae", label: "ㅙ", kind: "vowel" },
  { roman: "oe", label: "ㅚ", kind: "vowel" },
  { roman: "wo", label: "ㅝ", kind: "vowel" },
  { roman: "we", label: "ㅞ", kind: "vowel" },
  { roman: "wi", label: "ㅟ", kind: "vowel" },
  { roman: "ui", label: "ㅢ", kind: "vowel" },
];

const level2Entries = [
  { label: "가", roman: "ga", kind: "l2" },
  { label: "나", roman: "na", kind: "l2" },
  { label: "다", roman: "da", kind: "l2" },
  { label: "라", roman: "ra", kind: "l2" },
  { label: "마", roman: "ma", kind: "l2" },
  { label: "바", roman: "ba", kind: "l2" },
  { label: "사", roman: "sa", kind: "l2" },
  { label: "아", roman: "a", kind: "l2" },
  { label: "자", roman: "ja", kind: "l2" },
  { label: "차", roman: "cha", kind: "l2" },
  { label: "카", roman: "ka", kind: "l2" },
  { label: "타", roman: "ta", kind: "l2" },
  { label: "파", roman: "pa", kind: "l2" },
  { label: "하", roman: "ha", kind: "l2" },
  { label: "까", roman: "gga", kind: "l2" },
  { label: "따", roman: "dda", kind: "l2" },
  { label: "빠", roman: "bba", kind: "l2" },
  { label: "싸", roman: "ssa", kind: "l2" },
  { label: "짜", roman: "jja", kind: "l2" },
];

const level3Triads = [
  [
    { label: "자다", roman: "jada", kind: "minimal" },
    { label: "짜다", roman: "jjada", kind: "minimal" },
    { label: "차다", roman: "chada", kind: "minimal" },
  ],
  [
    { label: "바지다", roman: "bajida", kind: "minimal" },
    { label: "빠지다", roman: "bbajida", kind: "minimal" },
    { label: "파지다", roman: "pajida", kind: "minimal" },
  ],
  [
    { label: "가다", roman: "gada", kind: "minimal" },
    { label: "까다", roman: "ggada", kind: "minimal" },
    { label: "카다", roman: "kada", kind: "minimal" },
  ],
  [
    { label: "다다", roman: "dada", kind: "minimal" },
    { label: "따다", roman: "ddada", kind: "minimal" },
    { label: "타다", roman: "tada", kind: "minimal" },
  ],
];

const level3Pairs = [
  [
    { label: "사다", roman: "sada", kind: "minimal" },
    { label: "싸다", roman: "ssada", kind: "minimal" },
  ],
];

const level3MeaningWords = [
  { label: "나무", roman: "namu", kind: "word" },
  { label: "바다", roman: "bada", kind: "word" },
  { label: "사과", roman: "sagua", kind: "word" },
  { label: "우유", roman: "wooyu", kind: "word" },
  { label: "아기", roman: "agi", kind: "word" },
  { label: "나라", roman: "nara", kind: "word" },
  { label: "다리", roman: "dari", kind: "word" },
  { label: "바나나", roman: "banana", kind: "word" },
  { label: "고기", roman: "gogi", kind: "word" },
  { label: "모자", roman: "moja", kind: "word" },
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

let correctEntry = null;
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
  return { options, correctEntry: correct };
}

function buildLevel2Round() {
  const [correct, wrong1, wrong2] = shuffle(level2Entries).slice(0, 3);
  const options = shuffle([correct, wrong1, wrong2]);
  return { options, correctEntry: correct };
}

function buildLevel3Round() {
  const useTriad = Math.random() < 0.6;

  if (useTriad) {
    const triad = pickDifferent(
      () => level3Triads[Math.floor(Math.random() * level3Triads.length)],
      (next) => `triad:${next.join("|")}` === lastLevel3SetKey
    );
    const correct = triad[Math.floor(Math.random() * triad.length)];
    const options = shuffle(triad);
    return {
      options,
      correctEntry: correct,
      setKey: `triad:${triad.map((t) => t.roman).join("|")}`,
    };
  }

  const pair = level3Pairs[Math.floor(Math.random() * level3Pairs.length)];
  const meaning = pickDifferent(
    () => level3MeaningWords[Math.floor(Math.random() * level3MeaningWords.length)],
    (next) => `pair:${pair.map((p) => p.roman).join("|")}|m:${next.roman}` === lastLevel3SetKey
  );
  const correct = pair[Math.floor(Math.random() * pair.length)];
  const options = shuffle([pair[0], pair[1], meaning]);
  return {
    options,
    correctEntry: correct,
    setKey: `pair:${pair.map((p) => p.roman).join("|")}|m:${meaning.roman}`,
  };
}

function getRoundByLevel(level) {
  if (level === 2) return buildLevel2Round();
  if (level === 3) return buildLevel3Round();
  return buildLevel1Round();
}

function getAudioUrl(entry, level) {
  if (!entry || !entry.roman) return null;

  if (level === 2) {
    return `./audio/ko/level2/l2_${entry.roman}.m4a`;
  }

  if (level === 3) {
    if (entry.kind === "minimal") {
      return `./audio/ko/level3/minimal/l3_min_${entry.roman}.m4a`;
    }
    if (entry.kind === "word") {
      return `./audio/ko/level3/word/l3_word_${entry.roman}.m4a`;
    }
    return null;
  }

  const pack = voicePacks[activePack];
  if (!pack) return null;
  const filename = pack.files[entry.roman];
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

function playVowel(entry, { force = false, waitEnd = false } = {}) {
  return new Promise((resolve) => {
    const src = getAudioUrl(entry, currentLevel);
    if (!src) {
      dbg("audio missing for entry:", entry?.roman || "(empty)");
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
    btn.dataset.roman = entry.roman;
    btn.dataset.kind = entry.kind || "vowel";
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
  correctEntry = round.correctEntry;
  if (currentLevel === 3 && round.setKey) {
    lastLevel3SetKey = round.setKey;
  }

  renderChoices(round.options);
  applyMobileTabIndex();
  afterRenderBlur();

  // 첫 사용자 제스처 전에는 자동재생하지 않음(모바일 정책)
  playVowel(correctEntry).finally(() => {
    isLocked = false;
  });
}

function handleChoice(btn) {
  const pickedRoman = btn?.dataset?.roman;
  const pickedKind = btn?.dataset?.kind;
  if (!pickedRoman) return;
  const pickedEntry = { roman: pickedRoman, kind: pickedKind || "vowel" };

  if (isTransitioning) return;
  userInteracted = true;

  // 잠긴 상태에서 오답 누르면 짧게 오답만 들려주기
  if (isLocked && (!correctEntry || pickedEntry.roman !== correctEntry.roman || pickedEntry.kind !== correctEntry.kind)) {
    btn.classList.add("bad");
    playVowel(pickedEntry, { force: true });
    setTimeout(() => btn.classList.remove("bad"), 350);
    streak = 0;
    return;
  }

  // 여기부터는 "판정" 들어감
  isLocked = true;

  if (correctEntry && pickedEntry.roman === correctEntry.roman && pickedEntry.kind === correctEntry.kind) {
    btn.classList.add("good");
    isTransitioning = true;
    streak += 1;

    // 정답 음성을 끝까지 재생하고 나서 다음 라운드
    playVowel(correctEntry, { force: true, waitEnd: true }).finally(() => {
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
  playVowel(pickedEntry, { force: true });
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
    dbg("replay tapped. correctEntry:", correctEntry?.roman || "(empty)");
    if (!correctEntry) {
      pickRound();
      return;
    }
    playVowel(correctEntry, { force: true });
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
