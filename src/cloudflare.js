'use strict'

const baseTemplate = (domain) => `
provider "cloudflare" {
  # set $CLOUDFLARE_EMAIL and $CLOUDFLARE_TOKEN
}

variable "domain" {
  default = "${domain}"
}
`

const recordTemplate = (id, data) => {
  let rec = Object.keys(data).filter(key => data[key]).map(key => '  ' + [key, JSON.stringify(data[key])].join(' = ')).join('\n')
  return `
resource "cloudflare_record" "${id}" {
  domain  = "\${var.domain}"
${rec}
}
`
}

module.exports = {
  baseTemplate,
  recordTemplate
}
