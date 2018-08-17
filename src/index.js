'use strict'

const {baseTemplate, recordTemplate} = require('./cloudflare') // TODO: make this not cloudflare-only

function processContents (contents, read, domain, ids) {
  let out = ''

  let nameMap = {}

  contents.split('\n').filter(l => l.trim()).filter(l => !l.startsWith('#')).map(line => line.replace(/\t+/g, ' ')).forEach(line => {
    let s = line.split(' ')
    let [type, name] = s.splice(0, 2)

    let content
    let proxy
    let ttl
    let prio

    let match
    name = name.replace('@', domain)
    if ((match = name.match(/\{([a-z0-9_.,]+)\}/))) {
      name = name.replace(match[0], '%')
      name = match[1].split(',').map(n => name.replace('%', n))
    } else {
      name = [name]
    }

    switch (type) {
      case 'A':
      case 'AAAA':
      case 'CNAME':
      case 'CLINK':
        content = s[0]
        proxy = s[1]
        ttl = s[2]
        break
      case 'TXT':
        content = s.join(' ')
        break
      case 'DNSLINK':
      case 'NS':
        content = s[0]
        break
      case 'MX':
        prio = s[0]
        content = s[1]
        break
      case 'INCLUDE':
        out += processContents(read(name[0]), read, domain, ids)
        return
      default: throw new Error(type)
    }

    switch (type) {
      case 'CNAME':
      case 'MX':
      case 'NS':
        if (content.startsWith('$')) content = content.substr(1) + '.i.zion.host'
        else if (content.startsWith('!')) content = content.substr(1) + '.i.mkg20001.io'
        else if (content.endsWith('.')) content = content.substr(0, content.length - 1)
        else content += '.' + domain
        break
      default: // throw new TypeError(type)
    }

    name.forEach(name => {
      if (!nameMap[name]) {
        nameMap[name] = []
      }

      let id = name.replace(/\./g, '-').replace(/\*/g, 'W') + '_' + type
      let _id = id
      if (!ids[id]) ids[id] = 0
      if (ids[id]) id += '_' + ids[id]
      ids[_id]++

      let data

      switch (type) {
        case 'A':
        case 'AAAA':
        case 'CNAME':
          data = {name, value: content, type, proxied: proxy || 'false', ttl}
          break
        case 'CLINK':
          nameMap[content].forEach(d => {
            let _id = d[0]
            d = Object.assign({}, d[1])
            d.proxied = proxy || 'false'
            d.ttl = ttl
            d.name = name
            out += recordTemplate(id + '_' + _id, d)
          })
          break
        case 'TXT':
        case 'NS':
          data = {name, value: content, type}
          break
        case 'DNSLINK':
          data = {name: '_dnslink.' + name, value: 'dnslink=' + content, type: 'TXT'}
          break
        case 'MX':
          data = {name, value: content, type, priority: prio}
          break
        default: throw new Error(type)
      }
      if (data) {
        nameMap[name].push([id, data])
        out += recordTemplate(id, data)
      }
    })
  })

  return out
}

function processFile (domain, read, file) {
  let out = baseTemplate(domain)
  out += processContents(read(file), domain, {})
  return out
}

module.exports = {
  processContents,
  processFile
}
