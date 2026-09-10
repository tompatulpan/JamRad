

# JamRad

📻 JamRad is a ham-radio-themed fork of [Jam](https://github.com/jam-systems/jam).

With JamRad you can create audio rooms that can be used for discussions, hamradio sessions, free flowing conversations and more. JamRad reskins this into a ham radio operating console, with a Push-To-Talk console, an radio-style theme, and ham radio terminology.

## Room Configuration via URL

You can configure a room by adding parameters as query parameters or as [`base64URL`](https://en.wikipedia.org/wiki/Base64#The_URL_applications) encoded string in the hash component of a url.

You can take a look at examples for room configurations via URLs in our [examples](./examples) directory or in our [Glide tutorial](https://medium.com/jam/lets-build-a-micro-clubhouse-using-glide-and-jam-32597368fc98)


| key                  | value                     | note |
|----------------------|---------------------------|------|
| `room.name`          | name of the room          |      |
| `room.description`   | description of the room   |      |
| `room.color`         | CSS value (e.g. "red" #CCCCCC) | primary color of the room, used for the primary action button and some styling like background chrome color, note that you need to encode the hash sign using %23 if passed as query parameter (#CCCCCC becomes %23CCCCCC) |
| `room.stageOnly`     | true                      | users join directly on stage instead of in the audience |
| `ux.noLeave`         | true                      | removes the "leave" button |
| `ux.autoCreate`      | true                      | create room if it does not exist yet |
| `ux.autoJoin`        | true                      | users join the room automatically without having to click a button to join |
| `ux.autoRejoin`      | true                      | users re-join the room automatically if they have been in the room previously without having to click a button to join |
| `identity.name`      | name of the user          |      |
| `identity.avatar`    | image URL of the user     | avatar, profile picture, user photo … |
| `keys.seed`    | string seed for deriving a public/private keypair     | a seed for deriving a public/private keypair. this keypair is for the current user within the room (related: creating rooms with a known set of moderators requires the public keys of the moderators) |



## Known Issues and Solutions

**📱 iPhone: audio output sometimes switches randomly between loudspeaker and earspeaker.**

Workaround: use bluetooth or cable headphones, this way audio will always go through the headphones.

**📱 iPhone & Android: when phone goes to sleep/lockscreen because of inactivity the microphone or sound output might stop working until you unlock the screen again**

Workaround: make sure you are using JamRad in the standalone browser instead of within a webview

**Participants can hear me but I can not hear them**

When participants join a room on JamRad they start in the "on Air" area (by server default Configuration).

## Host Your Own Server

Hosting your own JamRad server is easy.

### Minimum Requirements

To run your own JamRad instance we recommend a minimum of 1 GB RAM and a 1GHz CPU.

e.g.: a Raspberry Pi (1+ GB RAM) or the smallest [Digital Ocean Basic Droplet (1 GB RAM)](https://www.digitalocean.com/pricing/) or the smallest [Linode shared plan (1 GB RAM)](https://www.linode.com/pricing/) or [t2.micro (1 GB RAM) on Amazon Web Services](https://aws.amazon.com/ec2/instance-types/t2/) should be enough to get started.

### Install

1. Install docker and docker-compose (https://docs.docker.com/compose/install/)
1. `git clone https://github.com/tompatulpan/JamRad.git`
1. `cd JamRad/jamrad-app`
1. `cd deployment`
1. `cp .env.example .env`
1. `nano .env` set `JAM_HOST` to the domain you want JamRad to be available (If you are deploying on AWS you need a domain you own pointing to your sever as letsencrypt does not issue certificates for `*.compute.amazonaws.com` domains)
1. In your DNS settings point `${JAM_HOST}`, and `*.${JAM_HOST}` to your IP address (if you don't want a wildcard you need the subdomains `stun` and `turn` (e.g. stun.jamrad.example.com and turn.jamrad.example.com))
1. If you are behind a NAT:
   1. Open ports 3478 and 3480, both TCP and UDP, and 80 and 443, TCP, on your firewall
   1. `nano turnserver.conf` set `realm` to your domain. If you are running coturn behind NAT, you may need to add the parameter  `external-ip` and give it the value of your public IP address.
1. `docker-compose up -d`

### Update

**NOTE:** Make sure you have the newest version of docker-compose (install according to https://docs.docker.com/compose/install/).

1. `cd JamRad/jamrad-app/deployment`
2. `git pull`
3. `docker-compose pull`
4. `docker-compose up -d`

**NOTE:** If you update from a version before March 23rd to one after and you want to keep users' identities and rooms:

1. `cd JamRad/jamrad-app/deployment`
2. `docker-compose down`   
3. `git pull`
4. `docker-compose pull`
5. `mv ../pantryredis ../data`   
6. `docker-compose up -d`


## Jam SDK

JamRad is built on top of [Jam](https://github.com/jam-systems/jam)'s SDK. If you want to build your own audio room UI from scratch, or even develop a bot, Jam gives you the tools to do so as well! Take a look at [jam-core](https://gitlab.com/jam-systems/jam/-/tree/master/ui/packages/jam-core), the npm package which exposes all functionalities of Jam as a JavaScript library, without prescribing any UI.

For easily integrating `jam-core` into a React app, check out the companion package [jam-core-react](https://gitlab.com/jam-systems/jam/-/tree/master/ui/packages/jam-core-react). JamRad's UI itself is primarily built on `jam-core-react`.

## Develop

Directory overview:

`deployment`/ docker compose file for deploying and hosting of JamRad

`pantry`/ a lightweight server for handling authentication and coordination of JamRad

`ui`/ web based user interface based on the React framework

### Run the local dev environment

JamRad needs two servers running at the same time: `pantry` (backend API, default port 3001) and `ui` (frontend, default port 3000).

1. Install dependencies with yarn (classic v1) in both `pantry` and `ui`:
   ```
   corepack enable && corepack prepare yarn@1.22.19 --activate
   cd pantry && yarn install
   cd ../ui && yarn install
   ```
2. Start the pantry backend (no Redis required, `LOCAL=1` uses an in-memory store):
   ```
   cd pantry
   LOCAL=1 PORT=3001 node ./bin/www
   ```
3. In a separate terminal, start the ui dev server (esbuild + tailwind watch + express):
   ```
   cd ui
   JAM_CONFIG_DIR=$(pwd)/jam-config-theme \
   JAM_PANTRY_URL=http://localhost:3001 JAM_URL=http://localhost:3000 yarn start
   ```
   `JAM_CONFIG_DIR` must point at the `ui/jam-config-theme` folder (containing `jam-config.json`), otherwise the server serves an empty config. Do not set `JAM_HOST` locally — it's used to derive the default STUN/TURN hostnames and a `localhost` value produces malformed ICE server URLs; the default `beta.jam.systems` public STUN/TURN servers work fine for local testing.
4. Open http://localhost:3000 in your browser. Verify both servers are healthy:
   ```
   curl -s -o /dev/null -w "ui:%{http_code} " http://localhost:3000/
   curl -s -o /dev/null -w "pantry:%{http_code}\n" http://localhost:3001/
   ```
   Both should print `200`.

**Testing audio between two browsers on the same machine:** Jam stores a cryptographic identity keypair in `localStorage`, so two tabs in the same browser profile share the same identity and won't establish real peer-to-peer audio. Use a private/incognito window, a different browser, or a separate browser profile to test as a second user.


## Credit to the Jam project

**BTC:** 3HM1zPtLuwCGarbihNYVjFVwbFrFe9keqh

**ETH:** 0xe15265b2a309f0d20038e10b8df5a12fb5e916f8
