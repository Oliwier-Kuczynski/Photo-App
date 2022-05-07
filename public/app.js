"use strict";

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const returnBtn = document.querySelector("#return-btn");
const uploadBtn = document.querySelector("#upload-btn");
const uploadPopup = document.querySelector("#upload-popup");

const register = async function (e) {
  e.preventDefault();
  const username = registerForm.querySelector("#email").value;
  const password = registerForm.querySelector("#password").value;

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result = response.json();

  const data = await result;

  console.log(data);
};

const login = async function (e) {
  e.preventDefault();
  const username = loginForm.querySelector("#email").value;
  const password = loginForm.querySelector("#password").value;

  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result = response.json();

  const data = await result;

  const { redirectUrl } = data;

  window.location.href = redirectUrl;
};

const hideUpload = () => {
  uploadPopup.classList.toggle("hide");
};

if (registerForm) registerForm.addEventListener("submit", register);
if (loginForm) loginForm.addEventListener("submit", login);
if (returnBtn) returnBtn.addEventListener("click", hideUpload);
if (uploadBtn) uploadBtn.addEventListener("click", hideUpload);
