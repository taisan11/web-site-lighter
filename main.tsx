import { Hono } from 'hono'
import {jsxRenderer} from "hono/jsx-renderer"
import image from "./image.ts"
import video from "./video.ts"
import script from "./script.ts"
import github from "./github.ts"
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
    <h1>Cache API!!</h1>
    <p><b>image→<code>/image/ImagePath?format=format</code></b></p>
    <p>format:"avif" | "webp" | "jpeg" | "png"</p>
    <p><b>video→<code>/video/VideoPath</code></b></p>
    <p><b>script(beta)<code>/script/ScriptPath</code></b></p>
    <h3>Github<code>/gh</code></h3>
    <p><b>top page<code>/</code></b></p>
    <p><b>user page<code>/:username</code></b></p>
    <p><b>repository page<code>/username/repository</code></b></p>
    <p><b>file page<code>/username/repository/path</code></b></p>
    <p><b>file page(raw)<code>/username/repository/path?raw</code></b></p>
  </>)
})

app.route("/image",image)
app.route("/video",video)
app.route("/script",script)
app.route("/gh",github)

Deno.serve(app.fetch)
