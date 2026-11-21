
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const OWN = "Өз пікірімді жазамын";

let current = 0;
let user = null;

let answers = new Array(QUESTIONS.length).fill(null);

// ЖАУАПТЫ ТЕКСЕРУ

function validAnswer(answer) {
  return answer !== null && (
    answer.choice !== OWN ||
    answer.custom.trim().length > 0
  );
}

// СҰРАҚТЫ КӨРСЕТУ

function render() {
  const question = QUESTIONS[current];
  const saved = answers[current];

  $("counter").textContent =
    `${current + 1} / ${QUESTIONS.length}`;

  $("progressBar").style.width =
    `${((current + 1) / QUESTIONS.length) * 100}%`;

  $("category").textContent =
    `СҰРАҚ ${current + 1}`;

  $("questionTitle").textContent = question.text;

  $("options").replaceChildren();

  [...question.options, OWN].forEach((option, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer-option";
    button.textContent = `${index + 1}. ${option}`;

    const selected = saved?.choice === option;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));

    button.addEventListener("click", () => {
      const previousCustom =
        answers[current]?.custom || "";

      answers[current] = {
        choice: option,
        custom: option === OWN ? previousCustom : ""
      };

      render();

      if (option === OWN) {
        $("customAnswer").focus();
      }
    });

    $("options").appendChild(button);
  });

  const isCustom = saved?.choice === OWN;

  $("customArea").hidden = !isCustom;
  $("customAnswer").value = isCustom ? saved.custom : "";

  $("prevBtn").disabled = current === 0;
  $("nextBtn").disabled = !validAnswer(saved);

  $("nextBtn").textContent =
    current === QUESTIONS.length - 1
      ? "Аяқтау ✓"
      : "Келесі →";
}

// ӨЗ ЖАУАБЫН ЖАЗУ

$("customAnswer").addEventListener("input", event => {
  if (answers[current]?.choice === OWN) {
    answers[current].custom = event.target.value;

    $("nextBtn").disabled =
      !validAnswer(answers[current]);
  }
});

// АРТҚА ӨТУ

$("prevBtn").addEventListener("click", () => {
  if (current > 0) {
    current--;
    render();
  }
});

// КЕЛЕСІ СҰРАҚ НЕМЕСЕ АЯҚТАУ

$("nextBtn").addEventListener("click", async () => {
  if (!validAnswer(answers[current])) return;

  if (current < QUESTIONS.length - 1) {
    current++;
    render();
    return;
  }

  if (!user) {
    $("surveyError").textContent =
      "Алдымен аккаунтыңызға кіріңіз.";
    return;
  }

  $("nextBtn").disabled = true;
  $("surveyError").textContent = "Жауаптар сақталуда...";

  const results = QUESTIONS.map((question, index) => ({
    key: question.key,
    question: question.text,
    answer: answers[index].choice === OWN
      ? answers[index].custom.trim()
      : answers[index].choice
  }));

  try {
    // Әр қолданушының UID бойынша жеке құжаты
    await setDoc(doc(db, "responses", user.uid), {
      userId: user.uid,
      answers: results,
      updatedAt: serverTimestamp()
    });

    window.location.replace("result.html");
  } catch (error) {
    console.error(error);

    $("surveyError").textContent =
      "Жауаптарды сақтау мүмкін болмады. Firestore баптауларын тексеріңіз.";

    $("nextBtn").disabled = false;
  }
});

// АККАУНТТАН ШЫҒУ

$("logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

// ҚОЛДАНУШЫНЫ ТЕКСЕРУ

onAuthStateChanged(auth, account => {
  if (!account) {
    window.location.replace("login.html");
    return;
  }

  user = account;

  $("userEmail").textContent =
    account.email || "Қолданушы";

  render();
});