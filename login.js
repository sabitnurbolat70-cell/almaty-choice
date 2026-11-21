
import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const $ = id => document.getElementById(id);

const email = $("email");
const password = $("password");
const monkey = $("monkey");
const message = $("authMessage");
const submitButton = $("submitAuth");
const googleButton = $("googleLogin");

let mode = "login";

function showMessage(text) {
  message.textContent = text;
}

// 1. ПОШТА ЖАЗҒАНДА МАЙМЫЛ ҚАРАЙДЫ

email.addEventListener("focus", () => {
  monkey.classList.remove("covering");
});

email.addEventListener("input", () => {
  const offset = Math.min(email.value.length * 0.4, 7);

  document.querySelectorAll(".pupil").forEach(eye => {
    eye.style.transform = `translate(${offset}px, 2px)`;
  });
});

// 2. ҚҰПИЯСӨЗ КЕЗІНДЕ КӨЗІН ЖАБАДЫ

password.addEventListener("focus", () => {
  if (password.type === "password") {
    monkey.classList.add("covering");
  }
});

password.addEventListener("blur", () => {
  monkey.classList.remove("covering");
});

// 3. ҚҰПИЯСӨЗДІ КӨРСЕТУ / ЖАСЫРУ

$("togglePassword").addEventListener("click", () => {
  const hidden = password.type === "password";

  password.type = hidden ? "text" : "password";

  $("togglePassword").textContent =
    hidden ? "Жасыру" : "Көрсету";

  monkey.classList.toggle("covering", !hidden);
});

// 4. КІРУ / ТІРКЕЛУ РЕЖИМДЕРІ

function setMode(newMode) {
  mode = newMode;
  showMessage("");

  $("loginTab").classList.toggle(
    "active", mode === "login"
  );

  $("registerTab").classList.toggle(
    "active", mode === "register"
  );

  $("modeTitle").textContent =
    mode === "login"
      ? "Қайта қош келдің!"
      : "Жаңа аккаунт құру";

  submitButton.textContent =
    mode === "login" ? "Кіру ↗" : "Тіркелу ↗";

  password.autocomplete =
    mode === "login"
      ? "current-password"
      : "new-password";
}

$("loginTab").addEventListener("click", () => {
  setMode("login");
});

$("registerTab").addEventListener("click", () => {
  setMode("register");
});

// 5. ҚАТЕЛЕРДІ ҚАЗАҚША КӨРСЕТУ

function translateError(error) {
  const errors = {
    "auth/email-already-in-use":
      "Бұл электрондық пошта тіркелген.",

    "auth/invalid-email":
      "Электрондық пошта дұрыс емес.",

    "auth/weak-password":
      "Құпиясөз тым әлсіз.",

    "auth/invalid-credential":
      "Пошта немесе құпиясөз қате.",

    "auth/too-many-requests":
      "Тым көп әрекет жасалды. Кейінірек қайталаңыз.",

    "auth/network-request-failed":
      "Интернет байланысын тексеріңіз.",

    "auth/operation-not-allowed":
      "Бұл кіру әдісі Firebase-та қосылмаған.",

    "auth/unauthorized-domain":
      "Сайт доменіне Firebase-та рұқсат берілмеген.",

    "auth/popup-closed-by-user":
      "Google кіру терезесі жабылды."
  };

  return errors[error.code] ||
    `Қате: ${error.code || error.message}`;
}

// 6. ПОШТАМЕН ТІРКЕЛУ / КІРУ

$("authForm").addEventListener("submit", async event => {
  event.preventDefault();

  const userEmail = email.value.trim();
  const userPassword = password.value;

  if (userPassword.length < 6) {
    showMessage("Құпиясөз кемінде 6 таңбадан тұруы керек.");
    return;
  }

  submitButton.disabled = true;
  showMessage("Тексерілуде...");

  try {
    if (mode === "register") {
      await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
    } else {
      await signInWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
    }

    window.location.replace("survey.html");
  } catch (error) {
    showMessage(translateError(error));
    submitButton.disabled = false;
  }
});

// 7. GOOGLE АРҚЫЛЫ КІРУ

googleButton.addEventListener("click", async () => {
  googleButton.disabled = true;
  showMessage("Google аккаунты ашылуда...");

  try {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);

    window.location.replace("survey.html");
  } catch (error) {
    showMessage(translateError(error));
    googleButton.disabled = false;
  }
});

// 8. КІРІП ҚОЙҒАН ҚОЛДАНУШЫ

onAuthStateChanged(auth, user => {
  if (user) {
    window.location.replace("survey.html");
  }
});