# Domains & Environments

| Purpose            | Hostname / URL            | Status | Notes |
|--------------------|---------------------------|--------|-------|
| Primary Production | terra-indomita.ca         | Online | e.g. live cutover target |
| Staging Preview    | test.terra-indomita.ca    | TBD    | temporary subdomain routed to Cloudflare Pages |
| API Origin         | api.terra-indomita.ca     | TBD    | proxied via Cloudflare Tunnel |
| CMS/Admin          | admin.terra-indomita.ca   | TBD    | locked behind auth / Zero-Trust option |

## Action Items
- [ ] Confirm ownership/DNS control in Cloudflare
- [ ] Decide final staging hostname
- [ ] Note any legacy URLs requiring redirects

