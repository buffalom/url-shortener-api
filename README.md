# url-shortener-api

## Development

The following npm commands are available:

| Command               | Description                                 |
|-----------------------|---------------------------------------------|
| npm start             | Start api.                                  |
| npm run dbgod -- -h   | Get help for the dbgod script.              |
| npm run bench         | Start api benchmarks. (api must be running) |

## Deployment

Use the following Docker commands to start mongodb, redis and the api.

```docker
docker network create url-shortener
docker run -d --name url-shortener-redis --net url-shortener redis:latest
docker run -d --name url-shortener-mongo --net url-shortener mongo:latest
docker run -it -e NODE_ENV='production' -e REDIS_URL='redis://url-shortener-redis:6379' -e DB_URL='mongodb://url-shortener-mongo:27017/url-shortener' -e AUTH_SECRET='' -e PORT='3000' -p 3000:3000 --net url-shortener --name url-shortener-api buffalom/url-shortener-api:latest
```

## Environment Variables

| Key         	| Description                                                                                  	| Default                                           	| Hint                                 	|
|-------------	|----------------------------------------------------------------------------------------------	|---------------------------------------------------	|--------------------------------------	|
| Port        	| Port to start api on.                                                                        	| 3000                                              	|                                      	|
| DB_URL      	| URL to use to connect to mongo db.                                                           	| mongodb://url-shortener-mongo:27017/url-shortener 	|                                      	|
| REDIS_URL   	| URL to use to connect to redis.                                                              	| redis://url-shortener-redis:6379                  	|                                      	|
| AUTH_SECRET 	| Secret to use to sign JWT token. A new secret will reset all deactivate all existing tokens. 	| superduperultrasecret                             	| Required if NODE_ENV is 'production' 	|
| NODE_ENV    	| Environment. 'production' or 'development'.                                                  	| production                                        	|                                      	|

## Hints

Production allows AccessToken-cookie to be sent over https only.\
See [Set-Cookie](https://developer.mozilla.org/de/docs/Web/HTTP/Headers/Set-Cookie) section "Secure"
