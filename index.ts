let apiKey: string;
let password: string;
let requestToken: string;
let sessionId: string;
let username: string;

type Result = {
  request_token?: string;
  session_id?: string;
};

type Login = {
  username?: string;
  password?: string;
  request_token?: string;
};

type ResultMovie = {
  page: string;
  results: Movie[];
  total_pages: string;
};

type Movie = {
  original_title: string;
  id: string;
};

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

const divList = document.getElementById("div-list-container") as HTMLDivElement;

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
  console.log(sessionId);
  if (sessionId) releaseSearch();
});

searchButton.addEventListener("click", async () => {
  createList("1");
});

class HttpClient {
  static async get({
    url,
    method,
    body = {},
  }: {
    url: string;
    method: string;
    body?: Login;
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
}

function releaseSearch() {
  searchInput.disabled = false;
  searchButton.disabled = false;
}

async function searchMovie(query: string, page: string) {
  query = encodeURI(query);
  console.log(query);
  // return await HttpClient.get({
  //   url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
  //   method: "GET",
  // });
  return await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=a47c8e861370f3df73b313b7beb2b794&query=${query}&page=${page}`,
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
  divList.appendChild(ul);
  createPaginate(movies.page, movies.total_pages);
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
  divPaginate.setAttribute(
    "style",
    "display: flex; height: 20px; justify-content: center; align-items: center;"
  );
  paginateText.setAttribute("style", "margin: 0 5px");
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
  if (Number(moviesPage) === Number(moviesTotalPage))
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
