# SAP Security booth
## Usage
### Run in localhost
  1) run `npm install`
  2) cd web and `bower install`
  3) run `mongod.exe`
  4) run `node server.js`
  5) Goto `http://localhost:3000/#/login`
  6) Predfined user - `email: a@a.com password: a`
### Deploy to bluemix
#### One time installation
  1) `cf login -a api.ng.bluemix.net`
  2) `cf create-service mongodb 100 mean-mongo`
  3) `git clone https://github.com/meanjs/mean.git && cd mean`
  4) `npm install`
  5) `grunt build`
#### Every time
  1) `cf login -a api.ng.bluemix.net`
  2) `cf push`
