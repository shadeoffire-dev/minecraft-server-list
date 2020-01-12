const express = require( 'express' )
const compression = require( 'compression' )
const axios = require( 'axios' )
const next    = require( 'next' )
const cacheableResponse = require('cacheable-response')
const sm = require('sitemap')

//robots.txt
const options = {
  root: __dirname + '/static/',
  headers: {
    'Content-Type': 'text/plain;charset=UTF-8',
  }
};

// Import middleware.
const routes = require( './routes' )

// Setup app.
const app     = next( { dev: 'production' !== process.env.NODE_ENV } )
const handle  = app.getRequestHandler()
const handler = routes.getRequestHandler( app )

const ssrCache = cacheableResponse({
  ttl: 1000 * 60 * 60, // 1hour
  get: async ({ req, res, pagePath, queryParams }) => ({
    data: await app.renderToHTML(req, res, pagePath, queryParams)
  }),
  send: ({ data, res }) => res.send(data)
})

const determinePriority = (url) => {
  if (url.includes('pages/')) {
    return 0.6
  } else if (url.includes('posts/')) {
    return 1.0
  } else {
    return 1.0
  }
};

app.prepare()
  .then( () => {

    // Create server.
    const server = express();

    server.use(compression())

    server.get('/robots.txt', (req, res) => (
      res.status(200).sendFile('robots.txt', options)
    ));

    // Use our handler for requests.
    server.use( handler );

    // Don't remove. Important for the server to work. Default route.
    server.get( '*', ( req, res ) => {
      ssrCache({ req, res })
    } );

    // Get current port.
    const port = process.env.PORT || 3000;

    // Error check.
    server.listen( port, err => {
      if ( err ) {
        throw err;
      }

      // Where we starting, yo!
      console.log( `> Ready on port ${port}...` );
    } );
  } );
