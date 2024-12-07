import {Hono} from "hono"
import { etag } from 'hono/etag'
import { cache } from 'hono/cache'

const dns = new Hono({})

dns.use(etag())
dns.use(cache({
    cacheName: "script-cache",
    wait:true,
}))
dns.get("/:domain", async (c) => {
    const domain = c.req.param("domain")
    const queryRecord = c.req.query("r");
    const record: Deno.RecordType = queryRecord && ["A", "AAAA", "ANAME", "CAA", "CNAME", "MX", "NAPTR", "NS", "PTR", "SOA", "SRV", "TXT"].includes(String(queryRecord)) ? queryRecord as Deno.RecordType : "A";
    const data = await Deno.resolveDns(domain,record)
    return c.json(data)
})


export default dns