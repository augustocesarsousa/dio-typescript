let apiKey: string;
let listId: string;
let password: string;
let requestToken: string;
let sessionId: string;
let username: string;

type Login = {
  username?: string;
  password?: string;
  request_token?: string;
};

type Movie = {
  original_title: string;
  id: string;
};

type MovieList = {
  name?: string;
  description?: string;
  language?: string;
  media_id?: string;
}

type Result = {
  request_token?: string;
  session_id?: string;
};

type ResultMovie = {
  page: string;
  results: Movie[];
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
const passwordInput = document.getElementById("senha") as HTMLInputElement;
const apiKeyInput = document.getElementById("api-key") as HTMLInputElement;
const loginButton = document.getElementById(
  "login-button"
) as HTMLButtonElement;
const logoutButton = document.getElementById(
  "logout-button"
) as HTMLButtonElement;

const searchInput = document.getElementById("search") as HTMLInputElement;
const searchButton = document.getElementById(
  "search-button"
) as HTMLButtonElement;

const searchContainer = document.getElementById(
  "search-container"
) as HTMLDivElement;

const divList = document.getElementById("div-list-container") as HTMLDivElement;

const createListNameInput = document.getElementById("create-list-name") as HTMLInputElement;
const createListDescriptionInput = document.getElementById("create-list-description") as HTMLInputElement;
const createListButton = document.getElementById("create-list-button") as HTMLButtonElement;

const addMovieToListInputIdMovie = document.getElementById("add-movie-to-list-id-movie") as HTMLInputElement;
const addMovieToListInputIdList = document.getElementById("add-movie-to-list-id-list") as HTMLInputElement;
const addMovieToListButton = document.getElementById("add-movie-to-list-button") as HTMLButtonElement;

const searchMovieListInput = document.getElementById("search-movie-list-id") as HTMLInputElement;
const searchMovieListButton = document.getElementById("search-movie-list-button") as HTMLButtonElement;

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

searchButton.addEventListener("click", async () => {
  createList("1");
});

createListButton.addEventListener("click",async () => {
  let name = createListNameInput.value;
  let description = createListDescriptionInput.value;
  let result = await createMovieList(name, description);
  if(result.success) showMessage("success", `List created successfully, id = ${result.list_id}`);
  if(result.list_id) listId = result.list_id;
});

addMovieToListButton.addEventListener("click",async () => {
  let movieId = addMovieToListInputIdMovie.value;
  let listId = addMovieToListInputIdList.value;
  let result = await addMovieToList(movieId, listId);
  if(result.success) showMessage("success", `Movie added to list successfully`);
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
  searchInput.disabled = disabled;
  searchButton.disabled = disabled;
  createListNameInput.disabled = disabled;
  createListDescriptionInput.disabled = disabled;
  createListButton.disabled = disabled;
  addMovieToListInputIdMovie.disabled = disabled;
  addMovieToListInputIdList.disabled = disabled;
  addMovieToListButton.disabled = disabled;
  searchMovieListInput.disabled = disabled;
  searchMovieListButton.disabled = disabled;
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
  searchInput.value = "";
  createListNameInput.value = "";
  createListDescriptionInput.value = "";
  addMovieToListInputIdMovie.value = "";
  addMovieToListInputIdList.value = "";
  searchMovieListInput.value = "";
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
    body?: Login | MovieList;
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

async function searchMovie(query: string, page: string) {
  query = encodeURI(query);
  console.log(query);
  return await HttpClient.get({
     url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`,
     method: "GET",
  });
}

async function createList(page: string) {
  divList.innerHTML = "";
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = searchInput.value;
  let movies: ResultMovie = (await searchMovie(query, page)) as ResultMovie;
  let ul = document.createElement("ul");
  ul.id = "lista";
  for (const movie of movies.results) {
    let li = document.createElement("li");
    li.appendChild(
      document.createTextNode(`${movie.id} - ${movie.original_title}`)
    );
    ul.appendChild(li);
  }
  createPaginate(movies.page, movies.total_pages);
  divList.appendChild(ul);
}

function createPaginate(moviesPage: string, moviesTotalPage: string) {
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

  if (Number(moviesPage) < 2) previuButton.disabled = true;
  if (Number(moviesPage) >= Number(moviesTotalPage))
    nextButton.disabled = true;

  previuButton.addEventListener("click", async () => {
    let page: string = String(Number(moviesPage) - 1);
    createList(page);
  });

  nextButton.addEventListener("click", async () => {
    let page: string = String(Number(moviesPage) + 1);
    createList(page);
  });
}

async function createMovieList(name: string, description: string) {
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

async function addMovieToList(movieId: string, listId: string) {
  return await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: movieId,
    },
  }) as ResultNewList;
}