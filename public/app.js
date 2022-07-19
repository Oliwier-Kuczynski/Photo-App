"use strict";

import * as imagesloaded from "./node_modules/imagesloaded/imagesloaded.pkgd.min.js";
import * as colcade from "./node_modules/colcade/colcade.js";

// DOM related
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

  popup.addEventListener("animationend", () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    popup.remove();
  });
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

  showFullTextContainerCloseBtn.addEventListener("click", () => {
    showFullTextContainer.classList.remove("show");
  });
};

const showLoadMoreBtns = function () {
  const showLoadMoreBtnsUtility = (element) => {
    if (
      document.querySelector(`[data-articles-grid-${element}]`).children[0]
        .children.length > 0
    ) {
      document.querySelector(
        `[data-load-more-btn="${element}"]`
      ).style.display = "block";
    }
  };

  if (document.body.hasAttribute("data-profile")) {
    showLoadMoreBtnsUtility("uploaded-by-user");
    showLoadMoreBtnsUtility("purchased-by-user");
  }

  if (document.body.hasAttribute("data-author"))
    showLoadMoreBtnsUtility("uploaded-by-author");
};

const slideToDelete = function (e, isMobile) {
  const targetElement = e.target.closest("[data-drag-element]");
  if (!targetElement) return;

  targetElement.style.setProperty(
    "--height",
    getComputedStyle(targetElement).height
  );

  let isDown = true;

  let moving = false;

  const startX = isMobile
    ? e.touches[0].clientX - targetElement.getBoundingClientRect().left
    : e.clientX - targetElement.getBoundingClientRect().left;

  let currentX;

  let scrollX;

  // Scrolling
  const scroll = (e) => {
    moving = true;
    currentX = isMobile
      ? e.touches[0].clientX - targetElement.getBoundingClientRect().left
      : e.clientX - targetElement.getBoundingClientRect().left;
  };

  !isMobile && targetElement.addEventListener("mousemove", scroll);
  isMobile && targetElement.addEventListener("touchmove", scroll);

  const targetElementWidth = targetElement.getBoundingClientRect().width;

  setInterval(() => {
    if (!isDown) return;
    if (!moving) return;

    moving = false;

    scrollX = (currentX - startX) * 1.75;

    // Prevent from scrolling in other direction
    if (scrollX > 0) {
      targetElement.children[0].style.setProperty("--x", "0px");
      return;
    }

    // Prevents from further scrolling
    if (Math.abs(scrollX) >= targetElementWidth) {
      targetElement.children[0].style.setProperty(
        "--x",
        `-${targetElementWidth}px`
      );
      return;
    }

    // Responsible for reveling the element by making clip path bigger
    let clipPathGrowingSpeed = 0;

    if (Math.abs(scrollX) > 100) clipPathGrowingSpeed = Math.abs(scrollX) - 100;

    targetElement
      .querySelector("[data-secondary-content]")
      .style.setProperty("--size", `${clipPathGrowingSpeed * 2}px`);

    targetElement.children[0].style.setProperty("--x", `${scrollX}px`);
  }, 20);

  const endScrolling = () => {
    isDown = false;

    if (Math.abs(scrollX) >= targetElementWidth / 2 && scrollX < 0) {
      targetElement.classList.add("remove");

      targetElement.addEventListener("transitionend", () => {
        targetElement.remove();
      });

      removeFromCart(targetElement);
      return;
    }
    targetElement.children[0].style.setProperty("--x", "0px");
  };

  !isMobile && document.addEventListener("mouseup", endScrolling);
  isMobile && document.addEventListener("touchend", endScrolling);
};

// Sending requsets to the backend
let allowRequest = true;

const fetchData = async function (
  url,
  method,
  headers,
  body,
  isMessage = false,
  requestLimit = true
) {
  // Returns true if the request isn't allowed and request limit is enabled
  if (!allowRequest && requestLimit) return;

  let invokeInTime = 4000;

  if (!requestLimit) invokeInTime = 0;

  allowRequest = false;

  const response = await fetch(url, {
    method: method,
    headers,
    body,
  });

  const data = await response.json();

  setTimeout(() => {
    allowRequest = true;
  }, invokeInTime);

  if (!isMessage) return data;

  const { status, message, redirectUrl } = data;

  showMessage(status, message, redirectUrl);

  return data;
};

const registerForm = document.querySelector("[data-register-form]");

const register = function (e) {
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

const login = function (e) {
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

const formDataUploadEdit = function (fetchUrl, invokingElement) {
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

const deletePost = function (e) {
  const id = e.target.closest(".grid-item").id;

  fetchData(
    "/delete",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      id,
    }),
    true,
    false
  );
};

const logout = function (e) {
  e.preventDefault();

  fetchData(
    "/logout",
    "POST",
    { "Content-Type": "application/xml" },
    undefined,
    true
  );
};

const deleteAccount = function () {
  fetchData(
    "/close-account",
    "POST",
    { "Content-Type": "application/json" },
    undefined,
    true
  );
};

const changePassword = function (e) {
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

const resetPassword = function (e) {
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

let colc, colcUploadedByUser, colcPurchasedByUser, colcUploadedByAuthor;
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
  const authorId = urlParams.get("authorId");

  const products = await fetchData(
    "/load-more",
    "POST",
    { "Content-Type": "application/json" },
    JSON.stringify({
      startIndex,
      searchQuery,
      filter,
      authorId,
      callbackOption,
    }),
    false
  );

  if (!products?.length && interval) return clearInterval(interval);

  if (!products?.length) {
    const moreBtn = colcadeItem.element.parentElement.querySelector(
      "[data-load-more-btn]"
    );
    moreBtn.textContent = "End";
    moreBtn.style.pointerEvents = "none";

    return;
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
      } &#36</p>$<a href=${`author?authorId=${product.authorId}`} class=link-style-inherit >Author: ${
        product.authorName}
      } </a><p>Uploaded: ${date}</p> <p>Resolution: ${
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
      } &#36</p><a href=${`author?authorId=${product.authorId}`
      } class=link-style-inherit >Author: ${
        product.authorName
      } </a><p>Uploaded: ${date}</p> <p>Resolution: ${
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
          '<button class="btn-gray articles-container__button ai-c" data-add-to-cart-btn="">Add <img src="img/shopping-cart.svg" alt="shopping cart"></button>';

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
                <button class="btn-gray articles-container__button ai-c" data-delete-btn="">Delete <img src="img/delete.svg" alt="delete"></button>
              </div>`;

    loadMore(colcUploadedByUser, additionalHtml, btnDataset, false);
  }

  if (btnDataset === "uploaded-by-author") {
    const additionalHtml = `<button class="btn-gray articles-container__button ai-c" data-add-to-cart-btn="">Add <img src="img/shopping-cart.svg" alt="shopping cart"></button>`;

    loadMore(colcUploadedByAuthor, additionalHtml, btnDataset, true);
  }
};

const setCookie = function (name, value, date) {
  document.cookie = `${name}=${value};  expires=${date.toUTCString()}`;
};

const getCookie = function (name) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return cookieValue;
};

let loggedIn;
let cartItemsIds = [];

try {
  cartItemsIds = JSON.parse(getCookie("cart-items-ids"));
} catch {}

const getCartItems = async function () {
  const { products, isLoggedin, ids } = await fetchData(
    "/get-cart-items",
    "POST",
    {
      "Content-Type": "application/json",
    },
    JSON.stringify({ cartItemsIds }),
    false,
    false
  );

  loggedIn = isLoggedin;

  if (loggedIn) {
    cartItemsIds = ids;
  }

  setCookie(
    "cart-items-ids",
    JSON.stringify(cartItemsIds),
    new Date(2050, 1, 1)
  );

  return products;
};

const updateCartButton = async function (transition) {
  const products = await getCartItems();

  const cartBtn = document.querySelector("[data-cart-btn]");

  if (!cartBtn) return;

  cartBtn.querySelector("[data-cart-btn-quantity]").textContent =
    products.length;

  const sumAmount = products.reduce((x, y) => x + y.price, 0);

  cartBtn.querySelector("[data-cart-btn-amount]").textContent = sumAmount;

  if (!transition) return;

  cartBtn.classList.add("jump");

  cartBtn.addEventListener("transitionend", () =>
    cartBtn.classList.remove("jump")
  );
};

updateCartButton(false);

const addToCart = function (e) {
  const addToCartButton = e.target.closest("[data-add-to-cart-btn]");

  if (!addToCartButton) return;

  const id = e.target.closest(".grid-item").id;

  if (cartItemsIds.includes(id))
    return showMessage("ok", "Item already is in the cart");

  cartItemsIds.push(id);

  updateCartButton(true);

  showMessage("ok", "Item added to cart");
};

const removeFromCart = function (item) {
  const id = item.id;

  if (loggedIn) {
    fetchData(
      "/remove-from-cart",
      "POST",
      {
        "Content-Type": "application/json",
      },
      JSON.stringify({ id }),
      true,
      false
    );
  }

  const shopingCartCookieData = getCookie("cart-items-ids");

  if (!shopingCartCookieData) return;

  const shoppingCartItems = JSON.parse(shopingCartCookieData);

  shoppingCartItems.forEach((itemId) => {
    if (itemId === id) {
      shoppingCartItems.splice(shoppingCartItems.indexOf(itemId), 1);
      setCookie(
        "cart-items-ids",
        JSON.stringify(shoppingCartItems),
        new Date(2050, 1, 1)
      );
    }
  });
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

if (document.querySelector(".grid-uploaded-by-author")) {
  colcUploadedByAuthor = new Colcade(".grid-uploaded-by-author", {
    columns: ".grid-col-uploaded-by-author",
    items: ".grid-item-uploaded-by-author",
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
      addToCart(e);
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

// Shoping Cart
const shopingCart = document.querySelector("[data-shoping-cart]");

if (shopingCart) {
  shopingCart.addEventListener("touchstart", (e) => slideToDelete(e, true));
}

if (shopingCart) {
  shopingCart.addEventListener("mousedown", (e) => slideToDelete(e, false));
}

// Invoicing Functions
document.body.dataset.scroll && infiniteScroll();
document.body.hasAttribute("data-profile") && showLoadMoreBtns();
document.body.hasAttribute("data-author") && showLoadMoreBtns();
