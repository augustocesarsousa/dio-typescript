let apiKey;
let requestToken;
let username;
let password;
let sessionId;
let listId = "7101979";

const loginInput = document.getElementById("login") as HTMLInputElement;
const passwordInput = document.getElementById("senha") as HTMLInputElement;
const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
const loginButton = document.getElementById(
  "login-button"
) as HTMLButtonElement;

const searchInput = document.getElementById("search") as HTMLInputElement;
const searchButton = document.getElementById(
  "search-button"
) as HTMLButtonElement;

const searchContainer = document.getElementById(
  "search-container"
) as HTMLDivElement;

loginInput.addEventListener("change", () => {
  validateLoginButton();
});

passwordInput.addEventListener("change", () => {
  validateLoginButton();
});

apiKeyInput.addEventListener("change", () => {
  validateLoginButton();
});

function validateLoginButton() {
  if (loginInput.value && passwordInput.value && apiKeyInput.value) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}
