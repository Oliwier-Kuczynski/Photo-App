"use strict";

import * as colcade from "./node_modules/colcade/colcade.js";

const registerForm = document.querySelector("[data-register-form]");
const loginForm = document.querySelector("[data-login-form]");
const uploadBtn = document.querySelector("#upload-btn");
// const uploadPopup = document.querySelector("#upload-popup");
const menuBtn = document.querySelector("[data-nav-menu-btn]");
const filterBtn = document.querySelector("[data-filter-btn]");

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

  const result = response.json();

  const data = await result;

  if (response.ok) {
    window.location.href = "/";
  }

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

// Layout related

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
menuBtn.addEventListener("click", openMenu);
filterBtn.addEventListener("click", openFilter);
