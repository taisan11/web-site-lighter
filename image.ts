import { Hono } from "hono";
import { optimizeImage } from "npm:wasm-image-optimization-avif/esm";
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'

const image = new Hono()

type formats = "avif" | "webp" | "jpeg" | "png" | undefined

image.use(etag())
image.use(cache({
    cacheName: "image-cache",
    wait:true,

}))
image.all("*", async (c) => {
    const path = c.req.path.replace('/image/', '')
    const format: formats = ["avif", "webp", "jpeg", "png"].includes(String(c.req.param("format"))) ? c.req.param("format") as formats : "avif"
    const width = c.req.param("w");
    const quality = c.req.param("q");
    const [srcImage, contentType] = await fetch(path)
        .then(async (res) =>
            res.ok
                ? ([await res.arrayBuffer(), res.headers.get("content-type")] as const)
                : []
        )
        .catch(() => []);
    if (!srcImage) {
        return c.text("Not Found", 404)
    }

    if (contentType && ["image/svg+xml", "image/gif"].includes(contentType)) {
        c.header("Content-Type", contentType)
        c.header("Cache-Control", "public, max-age=31536000, immutable")
        return c.body(srcImage)
    }
    const image = await optimizeImage({
        image: srcImage,
        width: width ? parseInt(width) : undefined,
        quality: quality ? parseInt(quality) : undefined,
        format,
    });
    c.header("Content-Type", `image/${format}`)
    c.header("Cache-Control", "public, max-age=31536000, immutable")
    c.header("date", new Date().toUTCString())
    if (image) {
        return c.body(image);
    } else {
        return c.text("Image processing failed", 500);
    }
})

export default image