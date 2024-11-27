import { Hono } from "hono";
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'

const video = new Hono()

//load
//////
video.use(etag())
video.use(cache({
    cacheName: "video-cache",
    wait:true,
}))
video.all("*", async (c) => {
    const path = c.req.path.replace('/video/', '')
    const data = await fetch(path).then(res => res.arrayBuffer())
    c.header("Content-Type", "video/webm")
    return c.body(data)
})

export default video