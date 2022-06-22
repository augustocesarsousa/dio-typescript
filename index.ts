let apiKey: string;
let password: string;
let requestToken: string;
let sessionId: string;
let username: string;

type result = {
  request_token?: string;
  session_id?: string;
};

type body = {
  username?: string;
  password?: string;
  request_token?: string;
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

class HttpClient {
  static async get({
    url,
    method,
    body = {},
  }: {
    url: string;
    method: string;
    body?: body;
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
  })) as result;
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
  })) as result;
  sessionId = result.session_id as string;
}
