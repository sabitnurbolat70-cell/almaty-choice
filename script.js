const $ = (id) => document.getElementById(id);

/* ====== Google Sheets-ке жіберу (қаласаңыз, сілтемені қойыңыз) ====== */
const SHEET_URL = "";   // мысалы: "https://script.google.com/macros/s/.../exec"

function sendAnswers() {
  if (!SHEET_URL.startsWith("https://script.google.com")) return;
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ answers: answers.map(finalAnswer) })
  }).catch(() => {});
}

/* ====== Сауалнама логикасы ====== */
const quiz = $("quiz");
const result = $("result");
const bar = $("bar");
const counter = $("counter");
const questionEl = $("question");
const optionsEl = $("options");
const customEl = $("custom");
const backBtn = $("back");
const nextBtn = $("next");

const OWN = "✍️ Өз ойым / басқа нұсқа";

let current = 0;
// answers[i] = { choice: "мәтін", custom: "" }
let answers = new Array(QUESTIONS.length).fill(null);

function render() {
  const q = QUESTIONS[current];
  const saved = answers[current];

  counter.textContent = `Сұрақ ${current + 1} / ${QUESTIONS.length}`;
  bar.style.width = `${(current / QUESTIONS.length) * 100}%`;
  questionEl.textContent = q.text;

  optionsEl.innerHTML = "";
  [...q.options, OWN].forEach((text) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = text;
    if (saved && saved.choice === text) btn.classList.add("selected");
    btn.addEventListener("click", () => choose(text));
    optionsEl.appendChild(btn);
  });

  const isOwn = saved && saved.choice === OWN;
  customEl.hidden = !isOwn;
  customEl.value = isOwn ? saved.custom : "";

  backBtn.style.visibility = current === 0 ? "hidden" : "visible";
  nextBtn.textContent = current === QUESTIONS.length - 1 ? "Аяқтау ✓" : "Келесі →";
  updateNext();
}

function choose(text) {
  answers[current] = { choice: text, custom: text === OWN ? customEl.value : "" };
  render();
  if (text === OWN) customEl.focus();
}

function updateNext() {
  const a = answers[current];
  const ok = a && (a.choice !== OWN || a.custom.trim().length > 0);
  nextBtn.disabled = !ok;
}

customEl.addEventListener("input", () => {
  answers[current].custom = customEl.value;
  updateNext();
});

nextBtn.addEventListener("click", () => {
  if (current < QUESTIONS.length - 1) {
    current++;
    render();
  } else {
    showResult();
  }
});

backBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    render();
  }
});

function finalAnswer(a) {
  return a.choice === OWN ? `Өз ойы: ${a.custom.trim()}` : a.choice;
}

function showResult() {
  sendAnswers();
  bar.style.width = "100%";
  quiz.hidden = true;
  result.hidden = false;

  const summary = $("summary");
  summary.innerHTML = "";
  QUESTIONS.forEach((q, i) => {
    const item = document.createElement("div");
    item.className = "summary-item";
    const small = document.createElement("small");
    small.textContent = `${i + 1}. ${q.text}`;
    const span = document.createElement("span");
    span.textContent = finalAnswer(answers[i]);   // textContent — қауіпсіз
    item.append(small, span);
    summary.appendChild(item);
  });
}

$("restart").addEventListener("click", () => {
  answers = new Array(QUESTIONS.length).fill(null);
  current = 0;
  result.hidden = true;
  quiz.hidden = false;
  render();
});

$("download").addEventListener("click", () => {
  const data = QUESTIONS.map((q, i) => ({ question: q.key, answer: finalAnswer(answers[i]) }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "almaty-choice-result.json";
  link.click();
});

/* ====== Іске қосу ====== */
render();