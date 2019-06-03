var fs = require('fs')
var path = require('path')
var axios = require('axios')
var apiBenchmark = require('api-benchmark')

const EMAIL = 'test@test.test'
const PASSWORD = 'asdf'
const SERVICE = {
  api: 'http://localhost:3000'
}
const URL_TO_SHORT = 'https://www.tomdgm.ch/'

async function main() {
  let cookieHeader = ''
  let shortForRedirectBenchmark = ''

  // Signup
  try {
    let res = await axios({
      method: 'POST',
      url: SERVICE.api + '/signup',
      data: {
        email: EMAIL,
        password: PASSWORD,
        passwordConfirm: PASSWORD
      }
    })
    console.log('Signed up.')
  } catch(err) {
    console.log('Could not sign up. Assuming already signed up.')
  }

  // Signin
  try {
    let res = await axios({
      method: 'POST',
      url: SERVICE.api + '/signin',
      data: {
        email: EMAIL,
        password: PASSWORD
      }
    })
    cookieHeader = res.headers['set-cookie'][0]
    console.log('Logged in.')
  } catch(err) {
    console.log('Could not log in.')
    console.log(err)
    return
  }

  // Create short-url for redirect benchmark
  try {
    let res = await axios({
      method: 'POST',
      url: SERVICE.api + '/shorts',
      data: {
        url: URL_TO_SHORT
      },
      headers: {
        'Cookie': cookieHeader
      }
    })
    shortForRedirectBenchmark = res.data
    console.log('Short for redirect benchmark created.')
  } catch(err) {
    console.log('Could not create short-url for redirect benchmark.')
    console.log(err)
    return
  }

  // Benchmark
  const OUTPUT_FILE = path.join(__dirname, '../benchmarks.html')
  
  var routes = {
    short: {
      method: 'post',
      route: '/shorts',
      headers: {
        'Cookie': cookieHeader
      },
      data: {
        url: URL_TO_SHORT
      },
    },
    shorts: {
      method: 'get',
      route: '/shorts',
      headers: {
        'Cookie': cookieHeader
      },
    },
    redirect: {
      method: 'get',
      route: '/' + shortForRedirectBenchmark,
    },
  }
  
  var options = {
    runMode: 'sequence',
    maxConcurrentRequests: 1,
    minSamples: 100
  }
   
  apiBenchmark.measure(SERVICE, routes, options, (err, results) => {
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
}
main()
