# SAP Security booth

## Prerequisites  
* mongo  - `https://www.mongodb.org/downloads`
* nodejs - `https://nodejs.org/en/`
* bower  - `npm install -g bower`   

## Run in localhost
* run `npm install`
* cd web and run `bower install`
* run `mongod.exe` 
* run `node server.js`
* goto `http://localhost:3000/#/login`    

## DB Commands
* run mongo.exe
* run command `use appname`
`db.users.update({ "lastName" : "a" },{$set: { "game.level": "1" }})`
`db.users.update({"lastName" : "a"}, { $set: {"game.timeEnd":  "new Date(new Date().getTime() + -15 * 60000) " }})`
`db.users.find()` 
`db.dropDatabase()`      

## Mongo service 
* WebSite - `https://mongolab.com/home` 
* Local connection from shell: `mongo <dburl> -u <dbuser> -p <dbpassword>` 
* Remote connection: `mongodb://<dbuser>:<dbpassword>@<dburl>`     

## Heroku - hosting the nodeJS application
* WebSite - `https://dashboard.heroku.com/apps`
* un-ignore config/database.js