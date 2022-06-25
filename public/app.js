"use strict";

import * as colcade from "./node_modules/colcade/colcade.js";

// Selections
const registerForm = document.querySelector("[data-register-form]");

const loginForm = document.querySelector("[data-login-form]");

const uploadForm = document.querySelector("[data-upload-form]");

const editForm = document.querySelector("[data-edit-form]");

const changePasswordForm = document.querySelector(
  "[data-change-password-form]"
);

const menuBtn = document.querySelector("[data-nav-menu-btn]");

const filterBtn = document.querySelector("[data-filter-btn]");

const logoutBtn = document.querySelector("[data-logout-btn]");

const closeAccountBtn = document.querySelector("[data-close-account-btn]");

const articlesGrids = document.querySelectorAll("[data-articles-grid]");

const articlesGridsUploadedByUser = document.querySelector(
  "[data-articles-grid-uploaded-by-user]"
);

const zoomedInImg = document.querySelector("[data-zoomed-in-img]");

const zoomedInImgCloseBtn = document.querySelector(
  "[data-zoomed-in-img-close-btn]"
);

const searchForm = document.querySelector("[data-search-form]");

const searchFormSelect = document.querySelector("[data-search-form-select]");

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

const showConfirmation = function (callback) {
  const confirmationPopup = document.querySelector(
    "[data-confiramtion-pop-up]"
  );

  confirmationPopup.classList.add("show");

  confirmationPopup.addEventListener("click", (e) => {
    const target = e.target;

    if (target.dataset.option === "yes") {
      callback(e);
      confirmationPopup.classList.remove("show");
    }

    if (target.dataset.option === "no")
      confirmationPopup.classList.remove("show");
  });
};

const openMenu = () => {
  const menu = document.querySelector("[data-nav-menu]");
  const filterMenu = document.querySelector("[data-filter-menu]");
  const navSpace = document.querySelector("[data-nav-space]");

  if (filterMenu.classList.contains("show")) {
    filterMenu.classList.remove("show");
  }

  menu.classList.toggle("show");

  navSpace.style.height = `${menu.getBoundingClientRect().height}px`;
};

const openFilter = (e) => {
  e.preventDefault();

  const menu = document.querySelector("[data-nav-menu]");
  const filterMenu = document.querySelector("[data-filter-menu]");
  const navSpace = document.querySelector("[data-nav-space]");

  if (menu.classList.contains("show")) {
    menu.classList.remove("show");
  }

  filterMenu.classList.toggle("show");

  navSpace.style.height = `${filterMenu.getBoundingClientRect().height}px`;
};

const zoomImage = (e) => {
  const targetImg = e.target.closest("img");

  if (!targetImg) return;

  zoomedInImg.querySelector("[data-main-img]").src =
    targetImg.dataset.originalImgSource;

  zoomedInImg.classList.add("show");
};

const unZoomImage = () => {
  zoomedInImg.classList.remove("show");
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

const formDataUploadEdit = async function (fetchUrl, invokingElement) {
  const id = invokingElement.id;
  const title = invokingElement.querySelector("#title").value;
  const description = invokingElement.querySelector("#description").value;
  const price = invokingElement.querySelector("#price").value;
  const image = invokingElement.querySelector("#image").files[0];

  const formData = new FormData();

  formData.append("id", id);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("image", image);

  const response = await fetch(fetchUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
};

const uploadPost = function (e) {
  e.preventDefault();

  formDataUploadEdit("/upload", uploadForm);
};

const editPost = function (e) {
  e.preventDefault();

  formDataUploadEdit("/edit", editForm);
};

const deletePost = async function (e) {
  const id = e.target.closest(".grid-item").id;

  const response = await fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
    }),
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
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

const deleteAccount = async () => {
  const response = await fetch("close-account", {
    method: "POST",
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
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

const searchForQueryAndFilters = function (e) {
  e.preventDefault();
  const searchQuery = searchForm.querySelector("input").value;
  const filter = searchForm.querySelector("select").value;

  window.location.href = `/?searchquery=${searchQuery}&filter=${filter}`;
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

if (uploadForm) uploadForm.addEventListener("submit", uploadPost);

if (editForm) editForm.addEventListener("submit", editPost);

if (changePasswordForm)
  changePasswordForm.addEventListener("submit", changePassword);

if (logoutBtn) logoutBtn.addEventListener("click", logout);

if (zoomedInImgCloseBtn)
  zoomedInImgCloseBtn.addEventListener("click", unZoomImage);

if (closeAccountBtn)
  closeAccountBtn.addEventListener("click", () =>
    showConfirmation(deleteAccount)
  );

if (articlesGrids)
  articlesGrids.forEach((articlesGrid) =>
    articlesGrid.addEventListener("click", zoomImage)
  );

if (articlesGridsUploadedByUser)
  articlesGridsUploadedByUser.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-delete-btn")) {
      showConfirmation(deletePost.bind(this, e));
    }
  });

menuBtn.addEventListener("click", openMenu);

filterBtn.addEventListener("click", openFilter);

searchForm.addEventListener("submit", searchForQueryAndFilters);

searchFormSelect.addEventListener("change", searchForQueryAndFilters);
