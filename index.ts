let apiKey: string;
let listId: string;
let password: string;
let requestToken: string;
let sessionId: string;
let username: string;

type LoginBody = {
  username?: string;
  password?: string;
  request_token?: string;
};

type Media = {
  original_title: string;
  id: string;
};

type MediaBody = {
  name?: string;
  description?: string;
  language?: string;
  media_id?: string;
}

type Result = {
  request_token?: string;
  session_id?: string;
};

type ResultMediaByListId = {
  items: Media[];
};

type ResultMediaByMediaName = {
  page: string;
  results: Media[];
  total_pages: string;
};

type ResultNewList = {
  status_code: number;
  status_message: string;
  success: boolean;
  list_id?: string;
}

const messagesSpan = document.getElementById("messages") as HTMLSpanElement;

const loginInput = document.getElementById("login") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
const loginButton = document.getElementById(
  "login-button"
) as HTMLButtonElement;
const logoutButton = document.getElementById(
  "logout-button"
) as HTMLButtonElement;

const searchMediaByNameInput = document.getElementById("search-media-by-name") as HTMLInputElement;
const searchMediaByNameButton = document.getElementById(
  "search-media-by-name-button"
) as HTMLButtonElement;

const searchMediaByListInput = document.getElementById("search-media-by-list-id") as HTMLInputElement;
const searchMediaByListButton = document.getElementById("search-media-by-list-button") as HTMLButtonElement;

const searchContainer = document.getElementById(
  "search-container"
) as HTMLDivElement;

const divList = document.getElementById("div-list-container") as HTMLDivElement;

const createListNameInput = document.getElementById("create-list-name") as HTMLInputElement;
const createListDescriptionInput = document.getElementById("create-list-description") as HTMLInputElement;
const createListButton = document.getElementById("create-list-button") as HTMLButtonElement;

const addMediaToListInputIdMedia = document.getElementById("add-media-to-list-id-media") as HTMLInputElement;
const addMediaToListInputIdList = document.getElementById("add-media-to-list-id-list") as HTMLInputElement;
const addMediaToListButton = document.getElementById("add-media-to-list-button") as HTMLButtonElement;

loginInput.addEventListener("change", () => {
  validateLoginButton();
});

passwordInput.addEventListener("change", () => {
  validateLoginButton();
});

apiKeyInput.addEventListener("change", () => {
  validateLoginButton();
});

loginButton.addEventListener("click", async () => {
  await createRequestToken();
  await login();
  await createSession();
  if (sessionId) {
    blockForms(false);
    blockLoginForm(true);
  }
});

logoutButton.addEventListener("click", () => {
  clearForms();
  blockForms(true);
  blockLoginForm(false);
})

searchMediaByNameButton.addEventListener("click", async () => {
  createListByMediaName("1");
});

searchMediaByListButton.addEventListener("click",async () => {
  createListByListId();
});

createListButton.addEventListener("click",async () => {
  let name = createListNameInput.value;
  let description = createListDescriptionInput.value;
  let result = await createMediaList(name, description);
  if(result.success) showMessage("success", `List created successfully, id = ${result.list_id}`);
  if(result.list_id) listId = result.list_id;
});

addMediaToListButton.addEventListener("click",async () => {
  let mediaId = addMediaToListInputIdMedia.value;
  let listId = addMediaToListInputIdList.value;
  let result = await addMediaToList(mediaId, listId);
  if(result.success) showMessage("success", `Media added to list successfully`);
});

function validateLoginButton() {
  username = loginInput.value;
  password = passwordInput.value;
  apiKey = apiKeyInput.value;

  if (username && password && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

function blockForms(disabled: boolean) {
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

function blockLoginForm(disabled: boolean) {
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

function showMessage(type: string, message: string) {
  messagesSpan.classList.add(type);
  messagesSpan.innerText = message;
}

class HttpClient {
  static async get({
    url,
    method,
    body = {},
  }: {
    url: string;
    method: string;
    body?: LoginBody | MediaBody;
  }) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      let borySend: string = "";
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
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
        request.setRequestHeader(
          "Content-Type",
          "application/json;charset=UTF-8"
        );
        borySend = JSON.stringify(body);
      }
      request.send(borySend);
    });
  }
}

async function createRequestToken() {
  let result = (await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET",
  })) as Result;
  requestToken = result.request_token as string;
}

async function login() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`,
    },
  });
}

async function createSession() {
  let result = (await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET",
  })) as Result;
  sessionId = result.session_id as string;
  console.log(sessionId);
}

async function searchMediaByMediaName(query: string, page: string) {
  query = encodeURI(query);
  return await HttpClient.get({
     url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`,
     method: "GET",
  }) as ResultMediaByMediaName;
}

async function searchMediaByListId(listId: string) {
  return await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET",
  }) as ResultMediaByListId;
}

async function createList(medias: Media[]) {
  let list = document.getElementById("list");
  if (list) {
    list.outerHTML = "";
  }
  let ul = document.createElement("ul");
  ul.id = "list";
  for (const media of medias) {
    let li = document.createElement("li");
    li.appendChild(
      document.createTextNode(`${media.id} - ${media.original_title}`)
    );
    ul.appendChild(li);
  }
  divList.appendChild(ul);
}

async function createListByMediaName(page: string) {
  divList.innerHTML = "";
  let query = searchMediaByNameInput.value;
  let result = await searchMediaByMediaName(query, page);
  createPaginate(result.page, result.total_pages);
  createList(result.results);  
}

async function createListByListId() {
  divList.innerHTML = "";
  let listId = searchMediaByListInput.value;
  let result = await searchMediaByListId(listId);
  createList(result.items);  
}

function createPaginate(mediasPage: string, mediasTotalPage: string) {
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

  if (Number(mediasPage) < 2) previuButton.disabled = true;
  if (Number(mediasPage) >= Number(mediasTotalPage))
    nextButton.disabled = true;

  previuButton.addEventListener("click", async () => {
    let page: string = String(Number(mediasPage) - 1);
    createListByMediaName(page);
  });

  nextButton.addEventListener("click", async () => {
    let page: string = String(Number(mediasPage) + 1);
    createListByMediaName(page);
  });
}

async function createMediaList(name: string, description: string) {
  return await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: name,
      description: description,
      language: "pt-br",
    },
  })  as ResultNewList;
}

async function addMediaToList(mediaId: string, listId: string) {
  return await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: mediaId,
    },
  }) as ResultNewList;
}