
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

let savedAnswers = [];

// НӘТИЖЕНІ FIRESTORE-ДАН ОҚУ

async function loadResult(user) {
  try {
    const documentRef = doc(db, "responses", user.uid);
    const snapshot = await getDoc(documentRef);

    if (!snapshot.exists()) {
      $("resultError").textContent =
        "Жауаптар табылмады. Алдымен сауалнамаға қатысыңыз.";
      return;
    }

    savedAnswers = snapshot.data().answers || [];

    $("answersList").replaceChildren();

    savedAnswers.forEach((item, index) => {
      const block = document.createElement("div");
      block.className = "answer-item";

      const question = document.createElement("strong");
      question.textContent = `${index + 1}. ${item.question}`;

      const answer = document.createElement("p");
      answer.textContent = item.answer;

      block.append(question, answer);
      $("answersList").appendChild(block);
    });
  } catch (error) {
    console.error(error);

    $("resultError").textContent =
      "Нәтижелерді жүктеу мүмкін болмады.";
  }
}

// JSON ЖҮКТЕУ

$("download").addEventListener("click", () => {
  if (savedAnswers.length === 0) return;

  const json = JSON.stringify(savedAnswers, null, 2);

  const blob = new Blob([json], {
    type: "application/json;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "almaty-choice-results.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
});

// ШЫҒУ

$("logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

// ҚОЛДАНУШЫНЫ ТЕКСЕРУ

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.replace("login.html");
  } else {
    loadResult(user);
  }
});