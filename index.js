"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let apiKey;
let password;
let requestToken;
let sessionId;
let username;
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
loginButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    yield createRequestToken();
    yield login();
    yield createSession();
    console.log(sessionId);
    if (sessionId)
        releaseSearch();
}));
searchButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    let lista = document.getElementById("lista");
    if (lista) {
        lista.outerHTML = "";
    }
    let query = searchInput.value;
    let movies = yield searchMovie(query);
    let ul = document.createElement("ul");
    ul.id = "lista";
    for (const movie of movies.results) {
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(movie.original_title));
        ul.appendChild(li);
    }
    console.log(movies);
    searchContainer.appendChild(ul);
}));
function validateLoginButton() {
    username = loginInput.value;
    password = passwordInput.value;
    apiKey = apiKeyInput.value;
    if (username && password && apiKey) {
        loginButton.disabled = false;
    }
    else {
        loginButton.disabled = true;
    }
}
class HttpClient {
    static get({ url, method, body = {}, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                let borySend = "";
                request.open(method, url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(JSON.parse(request.responseText));
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText,
                        });
                    }
                };
                request.onerror = () => {
                    reject({
                        status: request.status,
                        statusText: request.statusText,
                    });
                };
                if (body) {
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    borySend = JSON.stringify(body);
                }
                request.send(borySend);
            });
        });
    }
}
function createRequestToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = (yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
            method: "GET",
        }));
        requestToken = result.request_token;
    });
}
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
            method: "POST",
            body: {
                username: `${username}`,
                password: `${password}`,
                request_token: `${requestToken}`,
            },
        });
    });
}
function createSession() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = (yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
            method: "GET",
        }));
        sessionId = result.session_id;
    });
}
function releaseSearch() {
    searchInput.disabled = false;
    searchButton.disabled = false;
}
function searchMovie(query) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        console.log(query);
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
            method: "GET",
        });
    });
}
