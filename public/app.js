"use strict";

import * as imagesloaded from "./node_modules/imagesloaded/imagesloaded.pkgd.min.js";
import * as colcade from "./node_modules/colcade/colcade.js";

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

const zoomedInImg = document.querySelector("[data-zoomed-in-img]");

const zoomImage = (e) => {
  const targetImg = e.target.closest("img");

  if (!targetImg) return;

  zoomedInImg.querySelector("[data-main-img]").src =
    targetImg.dataset.originalImgSource;

  zoomedInImg.classList.add("show");

  const zoomedInImgCloseBtn = zoomedInImg.querySelector(
    "[data-zoomed-in-img-close-btn]"
  );

  zoomedInImgCloseBtn.addEventListener("click", (e) => {
    zoomedInImg.classList.remove("show");
  });
};

const showFullText = function (e) {
  const showFullTextContainer = document.querySelector(
    "[data-full-text-container]"
  );

  if (!e.target.closest("[data-full-text-btn]")) return;

  showFullTextContainer.querySelector("p").textContent = e.target
    .closest("article")
    .getAttribute("data-full-text");

  showFullTextContainer.classList.add("show");

  const showFullTextContainerCloseBtn = showFullTextContainer.querySelector(
    "[data-full-text-close-btn]"
  );

  showFullTextContainerCloseBtn.addEventListener("click", (e) => {
    showFullTextContainer.classList.remove("show");
  });
};

const showLoadMoreBtns = function () {
  if (
    document.querySelector("[data-articles-grid-uploaded-by-user]").children[0]
      .children.length > 0
  ) {
    document.querySelector(
      `[data-load-more-btn="uploaded-by-user"]`
    ).style.display = "block";
  }

  if (
    document.querySelector("[data-articles-grid-purchased-by-user]").children[0]
      .children.length > 0
  ) {
    document.querySelector(
      `[data-load-more-btn="purchased-by-user"]`
    ).style.display = "block";
  }
};

let allowRequest = true;

// Sending requsets to the backend
const fetchData = async function (url, method, headers, body, isMessage) {
  console.log();
  if (!allowRequest && url !== "/delete") return;

  allowRequest = false;

  const response = await fetch(url, {
    method: method,
    headers,
    body,
  });

  const data = await response.json();

  if (!isMessage) return data;

  const { status, message, redirectUrl } = data;

  setTimeout(() => {
    allowRequest = true;
  }, 4000);

  showMessage(status, message, redirectUrl);

  return data;
};

const registerForm = document.querySelector("[data-register-form]");

const register = async function (e) {
  e.preventDefault();
  const name = registerForm.querySelector("#name").value;
  const username = registerForm
    .querySelector("#email")
    .value.toLowerCase()
    .trim();
  const password = registerForm.querySelector("#password").value;
  const agreed = registerForm.querySelector("#agreed").checked;

  fetchData(
    "/register",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      username,
      password,
      name,
      agreed,
    }),
    true
  );
};

const loginForm = document.querySelector("[data-login-form]");

const login = async function (e) {
  e.preventDefault();
  const username = loginForm.querySelector("#email").value.toLowerCase().trim();
  const password = loginForm.querySelector("#password").value;

  fetchData(
    "/login",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      username,
      password,
    }),
    true
  );
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

  fetchData(fetchUrl, "POST", {}, formData, true);
};

const uploadForm = document.querySelector("[data-upload-form]");

const uploadPost = function (e) {
  e.preventDefault();

  formDataUploadEdit("/upload", uploadForm);
};

const editForm = document.querySelector("[data-edit-form]");

const editPost = function (e) {
  e.preventDefault();

  formDataUploadEdit("/edit", editForm);
};

const deletePost = async function (e) {
  const id = e.target.closest(".grid-item").id;

  fetchData(
    "/delete",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      id,
    }),
    true
  );
};

const logout = async function (e) {
  e.preventDefault();

  fetchData(
    "/logout",
    "POST",
    { "Content-Type": "application/xml" },
    undefined,
    true
  );
};

const deleteAccount = async () => {
  fetchData(
    "/close-account",
    "POST",
    { "Content-Type": "application/json" },
    undefined,
    true
  );
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

  fetchData(
    "/change-password",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ oldPassword, newPassword }),
    true
  );
};

const resetPassword = async function (e) {
  e.preventDefault();

  const username = document.querySelector("#email").value.toLowerCase().trim();
  const password = document.querySelector("#new-password").value;
  const code = document.querySelector("#verification-code").value;

  fetchData(
    "/reset-password",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ username, password, code }),
    true
  );
};

const sendVerificationCodeBtn = document.querySelector(
  "[data-send-verification-code-btn]"
);

const sendVerificationCode = async function (e) {
  e.preventDefault();

  const username = document.querySelector("#email").value.toLowerCase().trim();

  if (!username) return showMessage("error", "Email field is empty");

  const { status } = await fetchData(
    "/send-verification-code",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ username }),
    true
  );

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
  watermark,
  interval
) {
  startIndex += 5;

  const scrollCordsY = window.scrollY;
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("searchquery");
  const filter = urlParams.get("filter");

  const products = await fetchData(
    "/load-more",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({ startIndex, searchQuery, filter, callbackOption }),
    false
  );

  if (!products) return;

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

    let htmlString;

    if (product.description.length >= 80) {
      // prettier-ignore
      htmlString = `<img src="${
        watermark ? product.optimizedImgUrlWatermarked : product.optimizedImgUrl
      }" data-original-img-source="${
        watermark ? product.imgUrlWatermarked : product.imgUrl
      }" alt="article photo" class="articles-container__article-img">
      <h2>${product.title}</h2>
      <p>${product.description.slice(0, 80)} ${".".repeat(
        3
      )} <button class="articles-container__highlight" data-full-text-btn="">Read more</button></p>
      <div class="articles-container__article-info separetor"><p>Price: ${
        product.price
      } &#36</p><p>Author: ${
        product.authorName
      } </p><p>Uploaded: ${date}</p> <p>Resolution: ${
        product.resolution
      }</p></div>
      ${additionalHtml}
      `;
    }

    if (product.description.length <= 80) {
      // prettier-ignore
      htmlString = `<img src="${
        watermark ? product.optimizedImgUrlWatermarked : product.optimizedImgUrl
      }" data-original-img-source="${
        watermark ? product.imgUrlWatermarked : product.imgUrl
      }" alt="article photo" class="articles-container__article-img">
      <h2>${product.title}</h2>
      <p>${product.description}
      <div class="articles-container__article-info separetor"><p>Price: ${
        product.price
      } &#36</p><p>Author: ${
        product.authorName
      } </p><p>Uploaded: ${date}</p> <p>Resolution: ${
        product.resolution
      }</p></div>
      ${additionalHtml}
      `;
    }

    const item = document.createElement("article");

    item.className = `ver-spacer grid-item ${colcadeItem.options.items.slice(
      1
    )}`;
    item.setAttribute("id", product._id);
    item.setAttribute("data-full-text", product.description);
    item.insertAdjacentHTML("beforeend", htmlString);

    itemsToAppend.push(item);
  });

  colcadeItem.append(itemsToAppend);

  imagesLoaded(colcadeItem.element, function () {
    reloadColcade();
    window.scrollTo(0, scrollCordsY);
  });
};

const searchForm = document.querySelector("[data-search-form]");

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

      if (windowHeightPlusYOffset >= documentHeigth) {
        const additionalHtml =
          '<button class="btn-gray articles-container__button ai-c">Add <img src="img/shopping-cart.svg" alt="shopping cart"></button>';

        loadMore(colc, additionalHtml, "all", true, scrollInterval);
      }
    }
  }, 300);
};

const loadMoreByButton = function () {
  const btnDataset = this.dataset.loadMoreBtn;

  if (btnDataset === "uploaded-by-user") {
    const additionalHtml = `<div class="separetor control-btns">
                <a href="edit?id=<%= product._id %>" class="btn-gray articles-container__button ai-c" data-edit-btn="">Edit <img src="img/edit.svg" alt="edit"></a>
                <button class="btn-gray articles-container__button ai-c" data-delete-btn="">Delete <img src="img/edit.svg" alt="delete"></button>
              </div>`;

    loadMore(colcUploadedByUser, additionalHtml, btnDataset, false);
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

// Register Form
registerForm && registerForm.addEventListener("submit", register);

// Login Form
loginForm && loginForm.addEventListener("submit", login);

// Upload Form
uploadForm && uploadForm.addEventListener("submit", uploadPost);

// Edit Form
editForm && editForm.addEventListener("submit", editPost);

// Change Password Form
const changePasswordForm = document.querySelector(
  "[data-change-password-form]"
);

changePasswordForm &&
  changePasswordForm.addEventListener("submit", changePassword);
//

// Reset Password Form
const resetPasswordForm = document.querySelector("[data-reset-password-form]");

resetPasswordForm &&
  resetPasswordForm.addEventListener("submit", resetPassword);
//

// Logout Button
const logoutBtn = document.querySelector("[data-logout-btn]");

logoutBtn && logoutBtn.addEventListener("click", logout);
//

// Zoomed In Image Close Button

// Close Account Button
const closeAccountBtn = document.querySelector("[data-close-account-btn]");

closeAccountBtn &&
  closeAccountBtn.addEventListener("click", () =>
    showConfirmation(deleteAccount)
  );
//

// Send Verification Code Button
sendVerificationCodeBtn &&
  sendVerificationCodeBtn.addEventListener("click", sendVerificationCode);

// Load More Buttons
const loadMoreBtns = document.querySelectorAll("[data-load-more-btn]");

loadMoreBtns &&
  loadMoreBtns.forEach((loadMoreBtn) =>
    loadMoreBtn.addEventListener("click", loadMoreByButton.bind(loadMoreBtn))
  );
//

// Articles Grids
const articlesGrids = document.querySelectorAll("[data-articles-grid]");

articlesGrids &&
  articlesGrids.forEach((articlesGrid) =>
    articlesGrid.addEventListener("click", (e) => {
      zoomImage(e);
      showFullText(e);
    })
  );
//

// Articles Grids Uploaded By User
const articlesGridsUploadedByUser = document.querySelector(
  "[data-articles-grid-uploaded-by-user]"
);

articlesGridsUploadedByUser &&
  articlesGridsUploadedByUser.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-delete-btn")) {
      showConfirmation(deletePost.bind(this, e));
    }
  });
//

// Menu Button
const menuBtn = document.querySelector("[data-nav-menu-btn]");

menuBtn.addEventListener("click", openMenu);
//

// Filter Button
const filterBtn = document.querySelector("[data-filter-btn]");

filterBtn.addEventListener("click", openFilter);
//

// Search Form
searchForm.addEventListener("submit", searchForQueryAndFilters);

// Search Form Select
const searchFormSelect = document.querySelector("[data-search-form-select]");

searchFormSelect.addEventListener("change", searchForQueryAndFilters);
//

// Reload Colcade
document.addEventListener("DOMContentLoaded", reloadColcade);

// Invoicing Functions
document.body.dataset.scroll && infiniteScroll();
document.body.hasAttribute("data-profile") && showLoadMoreBtns();
