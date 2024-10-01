import type { Ingredient } from '../../shared/types'

export const ServerCommunicator = {
  getRequest: getRequest,
  postRequest: postRequest,
  patchRequest: patchRequest,
  deleteRequest: deleteRequest
}

function generateBaseUrl() {
  let baseUrl = window.location.origin
  if (baseUrl.startsWith("http://localhost")) {
    baseUrl = "http://localhost:8788"
  }
  return baseUrl
}

async function doRequest<T>(method: string, endpoint: string, bodyObject?: Object): Promise<T> {
  const response = await fetch(generateBaseUrl() + endpoint, {
    method: method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: bodyObject ? JSON.stringify(bodyObject) : null
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json() as T;
}

async function getRequest<T>(endpoint: string): Promise<T> {
  return await doRequest<T>("GET", endpoint)
}

async function postRequest<T>(endpoint: string, bodyObject?: Object): Promise<T> {
  return await doRequest<T>("POST", endpoint, bodyObject)
}

async function patchRequest<T>(endpoint: string, bodyObject?: Object): Promise<T> {
  return await doRequest<T>("PATCH", endpoint, bodyObject)
}

async function deleteRequest<T>(endpoint: string, bodyObject?: Object): Promise<T> {
  return await doRequest<T>("DELETE", endpoint, bodyObject)
}