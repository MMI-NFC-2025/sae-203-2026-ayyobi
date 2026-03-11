import PocketBase from 'pocketbase';

const url = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(url);

export default pb;
export { url };
