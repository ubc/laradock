require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')

const lti = require('ltijs').Provider

// Setup
lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb://' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: false // Set DevMode to true if the testing platform is in a different domain and https is not being used
  })

// Whitelisting the main app route and /nolti to create a landing page
lti.whitelist(lti.appRoute(), { route: new RegExp(/^\/nolti$/), method: 'get' }) // Example Regex usage

// When receiving successful LTI launch redirects to app, otherwise redirects to landing page
lti.onConnect(async (token, req, res, next) => {
  if (token) return res.sendFile(path.join(__dirname, './public/index.html'))
  else lti.redirect(res, '/nolti') // Redirects to landing page
})

// When receiving deep linking request redirects to deep link React screen
lti.onDeepLinking(async (connection, request, response) => {
  return lti.redirect(response, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
  await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: process.env.PLATFORM_NAME,
    clientId: process.env.PLATFORM_CLIENT_ID,
    authenticationEndpoint: process.env.PLATFORM_AUTH_ENDPOINT,
    accesstokenEndpoint: process.env.PLATFORM_ACCESS_TOKEN_ENDPOINT,
    authConfig: { method: 'JWK_SET',
      key: process.env.PLATFORM_JWKS_ENDPOINT }
  })
}

setup()
