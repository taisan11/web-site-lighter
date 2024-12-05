import {Hono} from "hono"
import { cfetch } from "./cachefetch.ts";
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'

const github = new Hono({})

github.use(etag())
github.use(cache({
    cacheName: "script-cache",
    wait:true,
}))

github.get("/", async (c) => {return c.redirect("https://github.com")})
github.get("/:uname", async (c) => {return c.redirect(`https://github.com/${c.req.param("uname")}`)})
github.get("/:uname/:repo", async (c) => {return c.redirect(`https://github.com/${c.req.param("uname")}/${c.req.param("repo")}`)})
github.get("/:uname/:repo/:path", async (c) => {
    const raw = c.req.query("raw")
    const username = c.req.param("uname")
    const repo = c.req.param("repo")
    const brunch = c.req.url.split("@")[1]||await cfetch(`https://api.github.com/repos/${username}/${repo}`).then((r) => r.json()).then((r) => r.default_branch).catch(() => "main")
    const path = c.req.param("path").split("@")[0]
    console.log({username, repo, brunch, path})
    if (raw) {
        return c.redirect(`https://raw.githubusercontent.com/${username}/${repo}/${brunch}/${path}`)
    }
    return c.redirect(`https://github.com/${username}/${repo}/blob/${brunch}/${path}`)
})

export default github