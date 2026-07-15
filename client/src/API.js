const SERVER_URL = 'http://localhost:3001/api/';

function getJson(httpResponsePromise) {
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {
          response.json()
            .then(json => resolve(json))
            .catch(err => reject({ error: "Cannot parse server response" }))
        } else {
          response.json()
            .then(obj => reject(obj))
            .catch(err => reject({ error: "Cannot parse server response" }))
        }
      })
      .catch(err => reject({ error: "Cannot communicate" }))
  });
}

// PUBLIC APIs
const getMenu = async () => {
  return getJson(fetch(SERVER_URL + 'menu', { credentials: 'include' }));
};

const getAvailability = async () => {
  return getJson(fetch(SERVER_URL + 'availability', { credentials: 'include' }));
};

// AUTH APIs
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  }));
};

const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    credentials: 'include'
  }));
};

const logOut = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  }));
};

const totpVerify = async (totpCode) => {
  return getJson(fetch(SERVER_URL + 'login-totp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code: totpCode }),
  }));
};

// ORDER APIs
const getOrders = async () => {
  return getJson(fetch(SERVER_URL + 'orders', { credentials: 'include' }));
};

const createOrder = async (sandwiches) => {
  return getJson(fetch(SERVER_URL + 'orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ sandwiches: sandwiches }),
  }));
};

const deleteOrder = async (orderId) => {
  return getJson(fetch(SERVER_URL + 'orders/' + orderId, {
    method: 'DELETE',
    credentials: 'include'
  }));
};

const API = { getMenu, getAvailability, logIn, getUserInfo, logOut, totpVerify, getOrders, createOrder, deleteOrder };
export default API;
