# simple-tf-dns

A tool made to make working with static terraform records simpler

> WIP

# Example

```
# Records

# Normal A/AAAA
#<type>	<domain><value>	<use-cloudflare>
A	@	1.2.3.4	true
AAAA	@	::2	true

# TXT
TXT	@	some-value

# CNAME
# will cname to $DOMAIN
CNAME	sub	@	true
# will cname to sub.$DOMAIN
CNAME	sub2	sub

# MX
MX	@	10	mail.provider.com

# DNSLINK create IPFS dnslink txts
# creates TXT dnslink=/ipfs/HASH
DNSLINK	@	/ipfs/HASH

# INCLUDE allows including other files
INCLUDE	domain-verifiction-txts
INCLUDE	global-mail-settings

# CLINK copies records from one domain to another (that way you can CNAME one domain to multiple other domains for load balancing)
CLINK	lb-test	server1
CLINK	lb-test	server2

# SHORT allows for pattern-reuse
SHORT	$	server%.example.com
CNAME	s-test	$1

# TODO: hidden (CLINK only) sub-domains
```
