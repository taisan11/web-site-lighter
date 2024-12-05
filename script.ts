import { Hono } from "hono";
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'
import {build,Plugin} from "esbuild-wasm"
import { env, nodeless } from "unenv";

const envConfig = env(nodeless, {});

const script = new Hono()

script.use(etag())
script.use(cache({
    cacheName: "script-cache",
    wait:true,
}))
script.all("/npm/*", async (c) => {
    const path = c.req.path.replace('/script/npm/', '')
    const match = path.match(/^(?<packageName>[^@]+)(?:@(?<version>.+))?$/);
    if (!match || !match.groups) {
        return new Response("Invalid package path", { status: 400 });
    }
    const { packageName, version } = match.groups;
    const aaa = await fetch(`https://esm.sh/${path}`)
    // const result = await build({
    //     stdin: {
    //         contents: await aaa.text(),
    //         sourcefile: "test.ts",
    //         resolveDir: "./",
    //     },
    //     bundle: true,
    //     minify: true,
    //     format: "esm",
    //     write: false,
    // });
    return new Response(await aaa.text(), {
        headers: {
            "Content-Type": "application/javascript",
        }
    })
})
script.all("*", async (c) => {
    const path = c.req.path.replace('/script/', '')
    const aaa = await fetch(`${path}`)
    const result = await build({
        stdin: {
            contents: await aaa.text(),
            sourcefile: "test.ts",
            resolveDir: "./",
        },
        bundle: true,
        minify: true,
        format: "esm",
        write: false,
    });
    return new Response(result.outputFiles[0].text, {
        headers: {
            "Content-Type": "application/javascript",
        }
    })
})

export default script