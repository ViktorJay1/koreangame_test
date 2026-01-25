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
  { key: "ui", label: "ㅢ" }
];

const voicePacks = {
  ko: {
    basePath: "audio/ko/vowels",
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
      wae: "wae.m4a",
      oe: "oe.m4a",
      wo: "wo.m4a",
      we: "we.m4a",
      wi: "wi.m4a",
      ui: "ui.m4a"
    }
  }
};

let activePack = "ko";

const choices = Array.from(document.querySelectorAll(".choice"));
const replayBtn = document.getElementById("replay");
let correctKey = "";
let isLocked = false;
let isTransitioning = false;

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getAudioUrl(key) {
  const pack = voicePacks[activePack];
  if (!pack || !pack.files[key]) return null;
  return `${pack.basePath}/${pack.files[key]}`;
}

function playVowel(key) {
  return new Promise(resolve => {
    const src = getAudioUrl(key);
    if (!src) {
      resolve();
      return;
    }

    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function pickRound() {
  isLocked = true;
  isTransitioning = false;
  clearFeedback();
  const [correct, wrong1, wrong2] = shuffle(vowelEntries).slice(0, 3);
  correctKey = correct.key;
  const options = shuffle([correct, wrong1, wrong2]);
  options.forEach((entry, idx) => {
    choices[idx].textContent = entry.label;
    choices[idx].dataset.key = entry.key;
  });
  playVowel(correctKey).finally(() => {
    isLocked = false;
  });
}

function clearFeedback() {
  choices.forEach(btn => {
    btn.classList.remove("good", "bad");
  });
}

function handleChoice(event) {
  const picked = event.currentTarget.dataset.key;
  if (!picked) return;
  if (isTransitioning) return;
  if (isLocked && picked !== correctKey) {
    event.currentTarget.classList.add("bad");
    playVowel(picked);
    setTimeout(() => {
      event.currentTarget.classList.remove("bad");
    }, 400);
    return;
  }
  isLocked = true;
  playVowel(picked);

  if (picked === correctKey) {
    event.currentTarget.classList.add("good");
    isTransitioning = true;
    playVowel(correctKey).finally(() => {
      const delay = 600 + Math.floor(Math.random() * 401);
      setTimeout(() => {
        pickRound();
      }, delay);
    });
  } else {
    event.currentTarget.classList.add("bad");
    setTimeout(() => {
      event.currentTarget.classList.remove("bad");
      isLocked = false;
    }, 400);
  }
}

replayBtn.addEventListener("click", () => {
  if (isTransitioning) return;
  playVowel(correctKey);
});

choices.forEach(btn => {
  btn.addEventListener("click", handleChoice);
});

pickRound();
