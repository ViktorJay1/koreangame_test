const vowels = [
  "ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ",
  "ㅐ", "ㅒ", "ㅔ", "ㅖ", "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅟ"
];

const choices = Array.from(document.querySelectorAll(".choice"));
const replayBtn = document.getElementById("replay");
let correctVowel = "";
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

function pickRound() {
  isLocked = true;
  isTransitioning = false;
  clearFeedback();
  const [correct, wrong1, wrong2] = shuffle(vowels).slice(0, 3);
  correctVowel = correct;
  const options = shuffle([correct, wrong1, wrong2]);
  options.forEach((vowel, idx) => {
    choices[idx].textContent = vowel;
    choices[idx].dataset.vowel = vowel;
  });
  speakVowel(correctVowel).finally(() => {
    isLocked = false;
  });
}

function clearFeedback() {
  choices.forEach(btn => {
    btn.classList.remove("good", "bad");
  });
}

function speakVowel(vowel) {
  return new Promise(resolve => {
    if ("speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance(vowel);
        utter.lang = "ko-KR";
        utter.rate = 0.9;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        return;
      } catch (err) {
        // Fall through to audio element.
      }
    }

    const audio = new Audio(`audio/${vowel}.mp3`);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function handleChoice(event) {
  const picked = event.currentTarget.dataset.vowel;
  if (!picked) return;
  if (isTransitioning) return;
  if (isLocked && picked !== correctVowel) {
    speakVowel(picked);
    return;
  }
  isLocked = true;
  speakVowel(picked);

  if (picked === correctVowel) {
    event.currentTarget.classList.add("good");
    isTransitioning = true;
    speakVowel(correctVowel).finally(() => {
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
  speakVowel(correctVowel);
});

choices.forEach(btn => {
  btn.addEventListener("click", handleChoice);
});

pickRound();
