'use strict'

/* eslint-disable no-tabs */
/* eslint-disable no-template-curly-in-string */
/* eslint-env mocha */

const {processFile} = require('..')

const head = '\nprovider "cloudflare" {\n  # set $CLOUDFLARE_EMAIL and $CLOUDFLARE_TOKEN\n}\n\nvariable "domain" {\n  default = "example.com"\n}\n\n'

const files = {
  aRecord: ['A @ 1.2.3.4', 'resource "cloudflare_record" "example-com_A" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "1.2.3.4"\n  type = "A"\n  proxied = "false"\n}\n'],
  aaaaRecord: ['AAAA @ ::1', 'resource "cloudflare_record" "example-com_AAAA" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "::1"\n  type = "AAAA"\n  proxied = "false"\n}\n'],
  txtRecord: ['TXT @ some-value', 'resource "cloudflare_record" "example-com_TXT" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "some-value"\n  type = "TXT"\n}\n'],
  cnameProxy: ['CNAME sub @ true', 'resource "cloudflare_record" "sub_CNAME" {\n  domain  = "${var.domain}"\n  name = "sub"\n  value = "example.com"\n  type = "CNAME"\n  proxied = "true"\n}\n'],
  cnameSub: ['CNAME sub2 sub', 'resource "cloudflare_record" "sub2_CNAME" {\n  domain  = "${var.domain}"\n  name = "sub2"\n  value = "sub.example.com"\n  type = "CNAME"\n  proxied = "false"\n}\n'],
  mxRecord: ['MX @ 10 mail.provider.com.', 'resource "cloudflare_record" "example-com_MX" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "mail.provider.com"\n  type = "MX"\n  priority = "10"\n}\n'],
  dnslink: ['DNSLINK @ /ipfs/HASH', 'resource "cloudflare_record" "example-com_DNSLINK" {\n  domain  = "${var.domain}"\n  name = "_dnslink.example.com"\n  value = "dnslink=/ipfs/HASH"\n  type = "TXT"\n}\n'],
  include: ['INCLUDE txtRecord', 'resource "cloudflare_record" "example-com_TXT" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "some-value"\n  type = "TXT"\n}\n'],
  clink: ['AAAA @ ::1\nCLINK sub @', 'resource "cloudflare_record" "example-com_AAAA" {\n  domain  = "${var.domain}"\n  name = "example.com"\n  value = "::1"\n  type = "AAAA"\n  proxied = "false"\n}\n\nresource "cloudflare_record" "sub_CLINK_example-com_AAAA" {\n  domain  = "${var.domain}"\n  name = "sub"\n  value = "::1"\n  type = "AAAA"\n  proxied = "false"\n}\n'],
  short: ['SHORT $ server%.example.com\nCNAME s-test $1', 'resource "cloudflare_record" "s-test_CNAME" {\n  domain  = "${var.domain}"\n  name = "s-test"\n  value = "server1.example.com"\n  type = "CNAME"\n  proxied = "false"\n}\n'],
  shortName: ['SHORT $ server%.example.com\nA $1 1.2.3.4', 'resource "cloudflare_record" "server1_A" {\n  domain  = "${var.domain}"\n  name = "server1"\n  value = "1.2.3.4"\n  type = "A"\n  proxied = "false"\n}\n']
}

const read = (f) => files[f][0]
const assert = require('assert')

describe('simple-tf-dns', () => {
  for (const file in files) { // eslint-disable-line guard-for-in
    it('should compile ' + file + ' correctly', () => {
      let out = processFile('example.com', read, file)
      if (!files[file][1]) {
        console.log(JSON.stringify(out.substr(head.length))) // eslint-disable-line no-console
      }
      assert.equal(out, head + files[file][1])
    })
  }
})
