var fs = require('fs')
var path = require('path')
var apiBenchmark = require('api-benchmark')

const ACCESS_TOKEN = 'SOME_VALID_TOKEN'
const OUTPUT_FILE = path.join(__dirname, '../benchmarks.html')

var service = {
  api: 'http://localhost:3000'
}

var routes = {
  short: {
    method: 'post',
    route: '/shorts',
    headers: {
      'Cookie': 'AccessToken=' + ACCESS_TOKEN
    },
    data: {
      url: 'https://tomdgm.ch'
    },
  },
  shorts: {
    method: 'get',
    route: '/shorts',
    headers: {
      'Cookie': 'AccessToken=' + ACCESS_TOKEN
    },
  },
  redirect: {
    method: 'get',
    route: '/mmdeAp',
  },
}

var options = {
  runMode: 'sequence',
  maxConcurrentRequests: 1,
  minSamples: 100
}
 
apiBenchmark.measure(service, routes, options, (err, results) => {
  if (err) {
    console.error(err)
    return
  }
  apiBenchmark.getHtml(results, (err, html) => {
    if (err) {
      console.error(err)
      return
    }
    fs.writeFileSync(OUTPUT_FILE, html)
    console.log('Done. Output written to ' + OUTPUT_FILE)
  })
})
