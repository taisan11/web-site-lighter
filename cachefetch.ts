export async function cfetch(url: string, options?: RequestInit): Promise<Response> {
    const cache = await caches.open("fetch-cache");
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
        return cachedResponse;
    }

    const response = await fetch(url, options);

    if (response && response.status === 200) {
        cache.put(url, response.clone());
    }

    return response;
}