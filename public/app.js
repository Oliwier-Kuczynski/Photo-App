const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");

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

if (registerForm) registerForm.addEventListener("submit", register);
if (loginForm) loginForm.addEventListener("submit", login);
