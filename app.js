const vowels = [
  "ㅏ",
  "ㅑ",
  "ㅓ",
  "ㅕ",
  "ㅗ",
  "ㅛ",
  "ㅜ",
  "ㅠ",
  "ㅡ",
  "ㅣ",
  "ㅐ",
  "ㅔ",
  "ㅒ",
  "ㅖ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅝ",
  "ㅞ",
];

const choices = Array.from(document.querySelectorAll(".choice"));
const listenButton = document.querySelector(".listen");
let currentAnswer = vowels[0];
let isLocked = false;
let fallbackAudio = null;

const supportsSpeech = "speechSynthesis" in window;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const speakWithWebSpeech = (vowel) =>
  new Promise((resolve) => {
    if (!supportsSpeech) {
      resolve(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(vowel);
    utterance.lang = "ko-KR";
    utterance.rate = 1;
    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });

const playFallbackAudio = (vowel) => {
  if (!fallbackAudio) {
    fallbackAudio = new Audio();
  }
  fallbackAudio.src = `/audio/${encodeURIComponent(vowel)}.mp3`;
  fallbackAudio.currentTime = 0;
  return fallbackAudio
    .play()
    .then(() => true)
    .catch(() => false);
};

const playVowel = async (vowel) => {
  const usedWebSpeech = await speakWithWebSpeech(vowel);
  if (usedWebSpeech) {
    return;
  }
  await playFallbackAudio(vowel);
};

const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const pickChoices = (answer) => {
  const others = vowels.filter((vowel) => vowel !== answer);
  shuffle(others);
  const options = shuffle([answer, others[0], others[1]]);
  return options;
};

const resetFeedback = () => {
  choices.forEach((button) => {
    button.classList.remove("correct", "wrong");
  });
};

const renderRound = () => {
  resetFeedback();
  currentAnswer = vowels[Math.floor(Math.random() * vowels.length)];
  const options = pickChoices(currentAnswer);
  options.forEach((vowel, index) => {
    choices[index].textContent = vowel;
    choices[index].dataset.vowel = vowel;
  });
  playVowel(currentAnswer);
};

const handleChoice = async (button) => {
  if (isLocked) {
    return;
  }

  const selected = button.dataset.vowel;
  if (!selected) {
    return;
  }

  playVowel(selected);

  if (selected === currentAnswer) {
    isLocked = true;
    button.classList.add("correct");
    await wait(250);
    await playVowel(currentAnswer);
    await wait(800);
    isLocked = false;
    renderRound();
  } else {
    button.classList.add("wrong");
    await wait(400);
    button.classList.remove("wrong");
  }
};

choices.forEach((button) => {
  button.addEventListener("click", () => handleChoice(button));
});

listenButton.addEventListener("click", () => {
  if (isLocked) {
    return;
  }
  playVowel(currentAnswer);
});

renderRound();
