let accessToken: string | null = null;

export function setAccessToken(token: string): void {accessToken = token;}

export async function apiFetch(path: string,options: RequestInit = {}):Promise<unknown>{
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("Content-Type","application/json");
  }
  if (accessToken !== null) {
    headers.set("Authorization",`Bearer ${accessToken}`);
  }
  const response = await fetch(`/api/v1${path}`,{...options,headers});
  if (!response.ok) {
    if (response.status === 401) {
      accessToken = null;
    } throw new Error(`API request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}