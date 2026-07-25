import { mkdir, writeFile } from 'node:fs/promises';

const worker = `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404 && !url.pathname.split('/').pop()?.includes('.')) {
      response = await env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }

    return response;
  },
};

export default worker;
`;

await mkdir(new URL('../dist/server/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/server/index.js', import.meta.url), worker);
