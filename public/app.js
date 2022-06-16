"use strict";

import * as colcade from "./node_modules/colcade/colcade.js";

const registerForm = document.querySelector("[data-register-form]");
const loginForm = document.querySelector("[data-login-form]");
const uploadForm = document.querySelector("[data-upload-form]");
const changePasswordForm = document.querySelector(
  "[data-change-password-form]"
);
const menuBtn = document.querySelector("[data-nav-menu-btn]");
const filterBtn = document.querySelector("[data-filter-btn]");
const logoutBtn = document.querySelector("[data-logout-btn]");
const closeAccountBtn = document.querySelector("[data-close-account-btn]");

// Layout related
const showMessage = (status, message, redirectUrl) => {
  if (document.querySelector("[data-popup]")) {
    document.querySelector("[data-popup]").remove();
  }

  const body = document.body;
  const htmlString = `
  <div class="pop-up h2 text-c" data-popup>
    <p>${message}</p>
  </div>
  `;

  body.insertAdjacentHTML("afterbegin", htmlString);

  if (status === "ok") {
    document.documentElement.style.setProperty("--status-indicator", "#3c9c1b");
  }

  if (status !== "ok") {
    document.documentElement.style.setProperty("--status-indicator", "#b30707");
  }

  const popup = document.querySelector("[data-popup]");

  setTimeout(() => {
    popup.remove();
    if (redirectUrl) window.location.href = redirectUrl;
  }, 4000);
};

const openMenu = () => {
  const menu = document.querySelector("[data-nav-menu]");
  const menuSpace = document.querySelector("[data-nav-menu-space]");
  const filterMenu = document.querySelector("[data-filter-menu]");

  if (filterMenu.classList.contains("show")) {
    filterMenu.classList.remove("show");
  }

  menu.classList.toggle("show");
  menuSpace.classList.toggle("show");
};

const openFilter = (e) => {
  e.preventDefault();

  const menu = document.querySelector("[data-nav-menu]");
  const menuSpace = document.querySelector("[data-nav-menu-space]");
  const filterMenu = document.querySelector("[data-filter-menu]");

  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
    menuSpace.classList.remove("show");
  }

  filterMenu.classList.toggle("show");
};

// Sending requsets to the backend

const register = async function (e) {
  e.preventDefault();
  const name = registerForm.querySelector("#name").value;
  const username = registerForm.querySelector("#email").value;
  const password = registerForm.querySelector("#password").value;
  const agreed = registerForm.querySelector("#agreed").checked;

  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      name,
      agreed,
    }),
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
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

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
};

const upload = async function (e) {
  e.preventDefault();
  const title = uploadForm.querySelector("#title").value;
  const description = uploadForm.querySelector("#description").value;
  const price = uploadForm.querySelector("#price").value;
  const image = uploadForm.querySelector("#image").files[0];

  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("image", image);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  const { status, message } = data;

  showMessage(status, message);
};

const logout = async function (e) {
  e.preventDefault();

  const response = await fetch("/logout", {
    method: "GET",
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
};

const showConfirmation = function () {
  const confirmationPopup = document.querySelector(
    "[data-confiramtion-pop-up]"
  );

  const deleteAccountFetch = async () => {
    const response = await fetch("close-account", {
      method: "POST",
    });

    const data = await response.json();

    const { status, message, redirectUrl } = data;

    showMessage(status, message, redirectUrl);

    confirmationPopup.classList.remove("show");
  };

  confirmationPopup.classList.add("show");

  confirmationPopup.addEventListener("click", (e) => {
    const target = e.target;

    if (target.dataset.option === "yes") deleteAccountFetch();

    if (target.dataset.option === "no")
      confirmationPopup.classList.remove("show");
  });
};

const changePassword = async function (e) {
  e.preventDefault();
  const oldPassword = document.querySelector("#old-password").value;
  const newPassword = document.querySelector("#new-password").value;
  const confirmPassword = document.querySelector("#confirm-password").value;

  if (newPassword !== confirmPassword) {
    showMessage("error", "Password does not match");
    return;
  }

  const response = await fetch("change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
};

// Colcade
if (document.querySelector(".grid")) {
  new Colcade(".grid", {
    columns: ".grid-col",
    items: ".grid-item",
  });
}

if (document.querySelector(".grid-additional")) {
  new Colcade(".grid-additional", {
    columns: ".grid-col-additional",
    items: ".grid-item-additional",
  });
}

// Eventlistners
if (registerForm) registerForm.addEventListener("submit", register);
if (loginForm) loginForm.addEventListener("submit", login);
if (uploadForm) uploadForm.addEventListener("submit", upload);
if (changePasswordForm)
  changePasswordForm.addEventListener("submit", changePassword);
if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (closeAccountBtn)
  closeAccountBtn.addEventListener("click", showConfirmation);
menuBtn.addEventListener("click", openMenu);
filterBtn.addEventListener("click", openFilter);
