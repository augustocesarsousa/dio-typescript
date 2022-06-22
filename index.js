"use strict";
let apiKey;
let requestToken;
let username;
let password;
let sessionId;
let listId = "7101979";
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("senha");
const apiKeyInput = document.getElementById("api-key");
const loginButton = document.getElementById("login-button");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const searchContainer = document.getElementById("search-container");
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
    }
    else {
        loginButton.disabled = true;
    }
}
