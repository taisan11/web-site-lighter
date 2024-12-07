import {Hono} from "hono"
import { cfetch } from "./cachefetch.ts";
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'
import mime from "mime"

const github = new Hono({})

github.use(etag())
github.use(cache({
    cacheName: "script-cache",
    wait:true,
}))

github.get("/", (c) => {return c.redirect("https://github.com")})
github.get("/:uname", (c) => {return c.redirect(`https://github.com/${c.req.param("uname")}`)})
github.get("/:uname/:repo", (c) => {return c.redirect(`https://github.com/${c.req.param("uname")}/${c.req.param("repo")}`)})
github.get("/:uname/:repo/:path", async (c) => {
    const raw = c.req.query("raw")
    const cache = c.req.query("cache")
    const username = c.req.param("uname")
    const repo = c.req.param("repo")
    const branch = c.req.url.split("@")[1] || await cfetch(`https://api.github.com/repos/${username}/${repo}`).then((r) => r.json()).then((r) => r.default_branch).catch(() => "main")
    const path = c.req.param("path").split("@")[0]
    if (raw !== undefined) {
        if (cache !== undefined) {
            console.log("cache")
            const aaa = cfetch(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`).then((r) => r.text())
            const fileName = path.split('/').pop()||"aaa.txt";
            c.header("Content-Type", mime.getType(fileName!) || "text/plain")
            return c.body(await aaa)
        } else {
            return c.redirect(`https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`)
        }
    }
    return c.redirect(`https://github.com/${username}/${repo}/blob/${branch}/${path}`)
})

export default github