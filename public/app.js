"use strict";

import * as imagesloaded from "./node_modules/imagesloaded/imagesloaded.pkgd.min.js";
import * as colcade from "./node_modules/colcade/colcade.js";

// Selections
const registerForm = document.querySelector("[data-register-form]");

const loginForm = document.querySelector("[data-login-form]");

const uploadForm = document.querySelector("[data-upload-form]");

const editForm = document.querySelector("[data-edit-form]");

const changePasswordForm = document.querySelector(
  "[data-change-password-form]"
);

const resetPasswordForm = document.querySelector("[data-reset-password-form]");

const menuBtn = document.querySelector("[data-nav-menu-btn]");

const filterBtn = document.querySelector("[data-filter-btn]");

const logoutBtn = document.querySelector("[data-logout-btn]");

const closeAccountBtn = document.querySelector("[data-close-account-btn]");

const sendVerificationCodeBtn = document.querySelector(
  "[data-send-verification-code-btn]"
);

const articlesGrids = document.querySelectorAll("[data-articles-grid]");

const articlesGridsUploadedByUser = document.querySelector(
  "[data-articles-grid-uploaded-by-user]"
);

const zoomedInImg = document.querySelector("[data-zoomed-in-img]");

const zoomedInImgCloseBtn = document.querySelector(
  "[data-zoomed-in-img-close-btn]"
);

const loadMoreBtns = document.querySelectorAll("[data-load-more-btn]");

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
  const username = registerForm
    .querySelector("#email")
    .value.toLowerCase()
    .trim();
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
  const username = loginForm.querySelector("#email").value.toLowerCase().trim();
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
    showMessage("error", "Passwords don't match");
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

const resetPassword = async function (e) {
  e.preventDefault();

  const username = document.querySelector("#email").value.toLowerCase().trim();
  const password = document.querySelector("#new-password").value;
  const code = document.querySelector("#verification-code").value;

  const response = await fetch("reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      code,
    }),
  });

  const data = await response.json();

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);
};

const sendVerificationCode = async function (e) {
  e.preventDefault();

  const username = document.querySelector("#email").value.toLowerCase().trim();

  if (!username) return showMessage("error", "Email field is empty");

  const response = await fetch("send-verification-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
    }),
  });

  const data = await response.json();

  const { status, message } = data;

  showMessage(status, message);

  if (status !== "ok") return;

  let secondsLeft = 60;

  sendVerificationCodeBtn.style.backgroundColor = "#474747";
  sendVerificationCodeBtn.style.pointerEvents = "none";
  sendVerificationCodeBtn.textContent = "60";

  const verificationCountdown = setInterval(() => {
    secondsLeft--;

    sendVerificationCodeBtn.textContent = secondsLeft;

    if (secondsLeft === 0) {
      clearInterval(verificationCountdown);

      sendVerificationCodeBtn.style.backgroundColor = "#3c9c1b";
      sendVerificationCodeBtn.style.pointerEvents = "all";
      sendVerificationCodeBtn.textContent = "Send";
    }
  }, 1000);
};

let colc, colcUploadedByUser, colcPurchasedByUser;
let startIndex = 0;

const loadMore = async function (
  colcadeItem,
  additionalHtml,
  callbackOption,
  interval
) {
  startIndex += 5;

  const scrollCordsY = window.scrollY;
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("searchquery");
  const filter = urlParams.get("filter");

  const response = await fetch("load-more", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startIndex,
      searchQuery,
      filter,
      callbackOption,
    }),
  });

  const products = await response.json();

  if (products.length === 0 && interval) return clearInterval(interval);

  if (products.length === 0) {
    const moreBtn = colcadeItem.element.parentElement.querySelector(
      "[data-load-more-btn]"
    );
    moreBtn.textContent = "End";
    moreBtn.style.pointerEvents = "none";
  }

  let itemsToAppend = [];

  products.forEach((product) => {
    const date = new Date(product.createdAt)
      .toISOString()
      .split("T")[0]
      .replaceAll("-", "/");

    const htmlString = `
      <img src="${product.optimizedImgUrl}" data-original-img-source="${product.imgUrl}" alt="article photo" class="articles-container__article-img">
      <h2>${product.title}</h2>
      <p>${product.description} <button class="articles-container__highlight">Read more</button></p>
      <div class="articles-container__article-info separetor"><p>Price: ${product.price} &#36</p><p>Author: ${product.authorName} </p><p>Uploaded: ${date}</p> <p>Resolution: ${product.resolution}</p></div>
      ${additionalHtml}
      `;

    const item = document.createElement("article");

    item.className = `ver-spacer ${colcadeItem.options.items.slice(1)}`;
    item.setAttribute("id", product._id);
    item.insertAdjacentHTML("beforeend", htmlString);

    itemsToAppend.push(item);
  });

  colcadeItem.append(itemsToAppend);

  imagesLoaded(colcadeItem.element, function () {
    reloadColcade();
    window.scrollTo(0, scrollCordsY);
  });
};

const searchForQueryAndFilters = function (e) {
  e.preventDefault();
  const searchQuery = searchForm.querySelector("input").value;
  const filter = searchForm.querySelector("select").value;

  window.location.href = `/?searchquery=${searchQuery}&filter=${filter}`;
};

const infiniteScroll = function () {
  let scrolling = false;

  window.addEventListener(
    "scroll",
    () => {
      scrolling = true;
    },
    { passive: true }
  );

  const scrollInterval = setInterval(() => {
    if (scrolling) {
      scrolling = false;

      const windowHeightPlusYOffset = window.scrollY + window.innerHeight;
      const documentHeigth = Math.trunc(
        document.documentElement.getBoundingClientRect().height
      );

      if (windowHeightPlusYOffset >= documentHeigth - 100) {
        const additionalHtml =
          '<button class="btn-gray articles-container__button ai-c">Add <img src="img/shopping-cart.svg" alt="shopping cart"></button>';

        loadMore(colc, additionalHtml, "all", scrollInterval);
      }
    }
  }, 300);
};

const loadMoreByButton = function () {
  const btnDataset = this.dataset.loadMoreBtn;

  if (btnDataset === "uploaded-by-user") {
    const additionalHtml = `<div class="separetor">
                <a href="edit?id=<%= product._id %>" class="btn-gray articles-container__button ai-c" data-edit-btn="">Edit <img src="img/edit.svg" alt="edit"></a>
                <button class="btn-gray articles-container__button ai-c" data-delete-btn="">Delete <img src="img/edit.svg" alt="delete"></button>
              </div>`;

    loadMore(colcUploadedByUser, additionalHtml, btnDataset);
  }
};

const showLoadMoreBtns = function () {
  if (
    document.querySelector("[data-articles-grid-uploaded-by-user]").children[0]
      .children.length < 5
  ) {
    document.querySelector(
      `[data-load-more-btn="uploaded-by-user"]`
    ).style.display = "none";
  }

  if (
    document.querySelector("[data-articles-grid-purchased-by-user]").children[0]
      .children.length < 5
  ) {
    document.querySelector(
      `[data-load-more-btn="purchased-by-user"]`
    ).style.display = "none";
  }
};

// Colcade

if (document.querySelector(".grid")) {
  colc = new Colcade(".grid", {
    columns: ".grid-col",
    items: ".grid-item",
  });
}

if (document.querySelector(".grid-uploaded-by-user")) {
  colcUploadedByUser = new Colcade(".grid-uploaded-by-user", {
    columns: ".grid-col-uploaded-by-user",
    items: ".grid-item-uploaded-by-user",
  });
}

if (document.querySelector(".grid-purchased-by-user")) {
  colcPurchasedByUser = new Colcade(".grid-purchased-by-user", {
    columns: ".grid-col-purchased-by-user",
    items: ".grid-item-purchased-by-user",
  });
}

const reloadColcade = function () {
  colc && colc.layout();
  colcUploadedByUser && colcUploadedByUser.layout();
  colcPurchasedByUser && colcPurchasedByUser.layout();
};

// Eventlistners
registerForm && registerForm.addEventListener("submit", register);

loginForm && loginForm.addEventListener("submit", login);

uploadForm && uploadForm.addEventListener("submit", uploadPost);

editForm && editForm.addEventListener("submit", editPost);

changePasswordForm &&
  changePasswordForm.addEventListener("submit", changePassword);

resetPasswordForm &&
  resetPasswordForm.addEventListener("submit", resetPassword);

logoutBtn && logoutBtn.addEventListener("click", logout);

zoomedInImgCloseBtn &&
  zoomedInImgCloseBtn.addEventListener("click", unZoomImage);

closeAccountBtn &&
  closeAccountBtn.addEventListener("click", () =>
    showConfirmation(deleteAccount)
  );

sendVerificationCodeBtn &&
  sendVerificationCodeBtn.addEventListener("click", sendVerificationCode);

loadMoreBtns &&
  loadMoreBtns.forEach((loadMoreBtn) =>
    loadMoreBtn.addEventListener("click", loadMoreByButton.bind(loadMoreBtn))
  );

articlesGrids &&
  articlesGrids.forEach((articlesGrid) =>
    articlesGrid.addEventListener("click", zoomImage)
  );

articlesGridsUploadedByUser &&
  articlesGridsUploadedByUser.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-delete-btn")) {
      showConfirmation(deletePost.bind(this, e));
    }
  });

menuBtn.addEventListener("click", openMenu);

filterBtn.addEventListener("click", openFilter);

searchForm.addEventListener("submit", searchForQueryAndFilters);

searchFormSelect.addEventListener("change", searchForQueryAndFilters);

document.addEventListener("DOMContentLoaded", reloadColcade);

// Invoicing Functions
document.body.dataset.scroll && infiniteScroll();
showLoadMoreBtns();
