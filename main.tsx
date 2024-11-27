import { Hono } from 'hono'
import {jsxRenderer} from "hono/jsx-renderer"
import image from "./image.ts"
import video from "./video.ts"
import {logger} from "hono/logger"
import { secureHeaders } from 'hono/secure-headers'

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response;
  }
}

const app = new Hono()

app.use(logger())
app.use(secureHeaders())
app.get(
  "*",
  jsxRenderer(({ children, title }) => {
    return (
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{title??"にゅ"}</title>
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);


app.get('/', (c) => {
  return c.render(<>
    <h1>Hello!!</h1>
    <p><b>image→<code>/image/ImagePath?format=format</code></b></p>
    <p>format:"avif" | "webp" | "jpeg" | "png"</p>
    <p><b>video→<code>/video/VideoPath</code></b></p>
  </>)
})

app.route("/image",image)
app.route("/video",video)

Deno.serve(app.fetch)
