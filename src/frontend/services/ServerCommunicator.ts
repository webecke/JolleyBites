import { useAuthStore } from '@/stores/authStore'

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

async function doRequest(method: string, endpoint: string, bodyObject?: Object): Promise<Response> {
  const authTokenObject = useAuthStore().getAuthToken()
  const authToken: string = authTokenObject != null ? authTokenObject : ""

  const response = await fetch(generateBaseUrl() + endpoint, {
    method: method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    },
    body: bodyObject ? JSON.stringify(bodyObject) : null
  });

  if (!response.ok) {
    console.error('Error:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    throw new Error(errorText);
  }

  return response;
}

async function getRequest<T>(endpoint: string): Promise<T> {
  return await (await doRequest<T>("GET", endpoint)).json() as T
}

async function postRequest<T>(endpoint: string, bodyObject?: Object): Promise<T> {
  return await (await doRequest<T>("POST", endpoint, bodyObject)).json() as T
}

async function patchRequest<T>(endpoint: string, bodyObject?: Object): Promise<T> {
  return await (await doRequest<T>("PATCH", endpoint, bodyObject)).json() as T
}

async function deleteRequest<T>(endpoint: string, bodyObject?: Object): Promise<void> {
  await doRequest<T>("DELETE", endpoint, bodyObject)
}
