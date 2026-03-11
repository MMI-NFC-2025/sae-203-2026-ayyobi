import PocketBase from 'pocketbase';

const baseUrl = import.meta.env.PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pocketbase = new PocketBase(baseUrl);

export function getBackendUrl() {
  return baseUrl;
}
