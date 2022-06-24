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
const logoutButton = document.getElementById("logout-button");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const searchContainer = document.getElementById("search-container");
const divList = document.getElementById("div-list-container");
const createListNameInput = document.getElementById("create-list-name");
const createListDescriptionInput = document.getElementById("create-list-description");
const createListButton = document.getElementById("create-list-button");
const addMovieInput = document.getElementById("add-movie-list-id");
const addMovieButton = document.getElementById("add-movie-list-button");
const searchMovieListInput = document.getElementById("search-movie-list-id");
const searchMovieListButton = document.getElementById("search-movie-list-button");
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
    if (sessionId) {
        blockForms(false);
        blockLoginForm(true);
    }
}));
logoutButton.addEventListener("click", () => {
    clearForms();
    blockForms(true);
    blockLoginForm(false);
});
searchButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    createList("1");
}));
createListButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    let name = createListNameInput.value;
    let description = createListDescriptionInput.value;
    createMovieList(name, description);
}));
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
function blockForms(disabled) {
    searchInput.disabled = disabled;
    searchButton.disabled = disabled;
    createListNameInput.disabled = disabled;
    createListDescriptionInput.disabled = disabled;
    createListButton.disabled = disabled;
    addMovieInput.disabled = disabled;
    addMovieButton.disabled = disabled;
    searchMovieListInput.disabled = disabled;
    searchMovieListButton.disabled = disabled;
}
function blockLoginForm(disabled) {
    loginInput.disabled = disabled;
    passwordInput.disabled = disabled;
    apiKeyInput.disabled = disabled;
    loginButton.disabled = disabled;
    logoutButton.disabled = !disabled;
}
function clearForms() {
    loginInput.value = "";
    passwordInput.value = "";
    apiKeyInput.value = "";
    searchInput.value = "";
    createListNameInput.value = "";
    createListDescriptionInput.value = "";
    addMovieInput.value = "";
    searchMovieListInput.value = "";
    divList.innerHTML = "";
}
function searchMovie(query, page) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        console.log(query);
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`,
            method: "GET",
        });
    });
}
function createList(page) {
    return __awaiter(this, void 0, void 0, function* () {
        divList.innerHTML = "";
        let lista = document.getElementById("lista");
        if (lista) {
            lista.outerHTML = "";
        }
        let query = searchInput.value;
        let movies = (yield searchMovie(query, page));
        let ul = document.createElement("ul");
        ul.id = "lista";
        for (const movie of movies.results) {
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(`${movie.id} - ${movie.original_title}`));
            ul.appendChild(li);
        }
        createPaginate(movies.page, movies.total_pages);
        divList.appendChild(ul);
    });
}
function createPaginate(moviesPage, moviesTotalPage) {
    let divPaginate = document.createElement("div");
    let previuButton = document.createElement("button");
    let nextButton = document.createElement("button");
    let paginateText = document.createElement("p");
    let page = document.createElement("span");
    let separator = document.createElement("span");
    let totalPage = document.createElement("span");
    divPaginate.id = "paginate-buttons";
    previuButton.id = "previu-button";
    nextButton.id = "next-button";
    paginateText.id = "paginate-text";
    page.id = "number-page";
    separator.id = "separator-page";
    totalPage.id = "total-page";
    previuButton.innerText = "Anterior";
    nextButton.innerText = "Próximo";
    page.innerText = moviesPage;
    separator.innerText = "/";
    totalPage.innerText = moviesTotalPage;
    paginateText.appendChild(page);
    paginateText.appendChild(separator);
    paginateText.appendChild(totalPage);
    divPaginate.appendChild(previuButton);
    divPaginate.appendChild(paginateText);
    divPaginate.appendChild(nextButton);
    divList.appendChild(divPaginate);
    if (Number(moviesPage) < 2)
        previuButton.disabled = true;
    if (Number(moviesPage) >= Number(moviesTotalPage))
        nextButton.disabled = true;
    previuButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        let page = String(Number(moviesPage) - 1);
        createList(page);
    }));
    nextButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        let page = String(Number(moviesPage) + 1);
        createList(page);
    }));
}
function createMovieList(name, description) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                name: name,
                description: description,
                language: "pt-br",
            },
        });
        console.log(result);
    });
}
