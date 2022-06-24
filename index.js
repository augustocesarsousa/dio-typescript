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
let listId;
let password;
let requestToken;
let sessionId;
let username;
const messagesSpan = document.getElementById("messages");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const apiKeyInput = document.getElementById("api-key");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const searchMediaByNameInput = document.getElementById("search-media-by-name");
const searchMediaByNameButton = document.getElementById("search-media-by-name-button");
const searchMediaByListInput = document.getElementById("search-media-by-list-id");
const searchMediaByListButton = document.getElementById("search-media-by-list-button");
const searchContainer = document.getElementById("search-container");
const divList = document.getElementById("div-list-container");
const createListNameInput = document.getElementById("create-list-name");
const createListDescriptionInput = document.getElementById("create-list-description");
const createListButton = document.getElementById("create-list-button");
const addMediaToListInputIdMedia = document.getElementById("add-media-to-list-id-media");
const addMediaToListInputIdList = document.getElementById("add-media-to-list-id-list");
const addMediaToListButton = document.getElementById("add-media-to-list-button");
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
searchMediaByNameButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    createListByMediaName("1");
}));
searchMediaByListButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    createListByListId();
}));
createListButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    let name = createListNameInput.value;
    let description = createListDescriptionInput.value;
    let result = yield createMediaList(name, description);
    if (result.success)
        showMessage("success", `List created successfully, id = ${result.list_id}`);
    if (result.list_id)
        listId = result.list_id;
}));
addMediaToListButton.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    let mediaId = addMediaToListInputIdMedia.value;
    let listId = addMediaToListInputIdList.value;
    let result = yield addMediaToList(mediaId, listId);
    if (result.success)
        showMessage("success", `Media added to list successfully`);
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
function blockForms(disabled) {
    searchMediaByNameInput.disabled = disabled;
    searchMediaByNameButton.disabled = disabled;
    createListNameInput.disabled = disabled;
    createListDescriptionInput.disabled = disabled;
    createListButton.disabled = disabled;
    addMediaToListInputIdMedia.disabled = disabled;
    addMediaToListInputIdList.disabled = disabled;
    addMediaToListButton.disabled = disabled;
    searchMediaByListInput.disabled = disabled;
    searchMediaByListButton.disabled = disabled;
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
    searchMediaByNameInput.value = "";
    createListNameInput.value = "";
    createListDescriptionInput.value = "";
    addMediaToListInputIdMedia.value = "";
    addMediaToListInputIdList.value = "";
    searchMediaByListInput.value = "";
    divList.innerHTML = "";
}
function showMessage(type, message) {
    messagesSpan.classList.add(type);
    messagesSpan.innerText = message;
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
        console.log(sessionId);
    });
}
function searchMediaByMediaName(query, page) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`,
            method: "GET",
        });
    });
}
function searchMediaByListId(listId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
            method: "GET",
        });
    });
}
function createList(medias) {
    return __awaiter(this, void 0, void 0, function* () {
        let list = document.getElementById("list");
        if (list) {
            list.outerHTML = "";
        }
        let ul = document.createElement("ul");
        ul.id = "list";
        for (const media of medias) {
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(`${media.id} - ${media.original_title}`));
            ul.appendChild(li);
        }
        divList.appendChild(ul);
    });
}
function createListByMediaName(page) {
    return __awaiter(this, void 0, void 0, function* () {
        divList.innerHTML = "";
        let query = searchMediaByNameInput.value;
        let result = yield searchMediaByMediaName(query, page);
        createPaginate(result.page, result.total_pages);
        createList(result.results);
    });
}
function createListByListId() {
    return __awaiter(this, void 0, void 0, function* () {
        divList.innerHTML = "";
        let listId = searchMediaByListInput.value;
        let result = yield searchMediaByListId(listId);
        createList(result.items);
    });
}
function createPaginate(mediasPage, mediasTotalPage) {
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
    page.innerText = mediasPage;
    separator.innerText = "/";
    totalPage.innerText = mediasTotalPage;
    paginateText.appendChild(page);
    paginateText.appendChild(separator);
    paginateText.appendChild(totalPage);
    divPaginate.appendChild(previuButton);
    divPaginate.appendChild(paginateText);
    divPaginate.appendChild(nextButton);
    divList.appendChild(divPaginate);
    if (Number(mediasPage) < 2)
        previuButton.disabled = true;
    if (Number(mediasPage) >= Number(mediasTotalPage))
        nextButton.disabled = true;
    previuButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        let page = String(Number(mediasPage) - 1);
        createListByMediaName(page);
    }));
    nextButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        let page = String(Number(mediasPage) + 1);
        createListByMediaName(page);
    }));
}
function createMediaList(name, description) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                name: name,
                description: description,
                language: "pt-br",
            },
        });
    });
}
function addMediaToList(mediaId, listId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                media_id: mediaId,
            },
        });
    });
}
