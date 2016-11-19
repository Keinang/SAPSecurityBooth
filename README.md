# SAP Security booth

## Prerequisites  
1) mongo  - `https://www.mongodb.org/downloads`
2) nodejs - `https://nodejs.org/en/`
3) bower  - `npm install -g bower`   

## Run in localhost

1) run `npm install`
2) cd web and `bower install`
3) run `mongod.exe` 
4) run `node server.js`
5) Goto `http://localhost:3000/#/login`    

## Change user level during development   
1) run mongo.exe
2) run command `use appname`
3) run command
`db.users.update(  
    { "lastName" : "a" },    
    {    
      $set: { "game.level": "1" }   
    }   
)`
update timestamp of a user - 
`db.users.update({"lastName" : "a"}, { $set: {"game.timeEnd":  "new Date(new Date().getTime() + -15 * 60000) " }})`

4) other commands: 
`db.users.find()` 
`db.dropDatabase()`      

## Mongo service 
WebSite - `https://mongolab.com/home` 
Local connection from shell: `mongo <dburl> -u <dbuser> -p <dbpassword>` 
Remote connection: `mongodb://<dbuser>:<dbpassword>@<dburl>`     

## Heroku - hosting the nodeJS application
WebSite - `https://dashboard.heroku.com/apps`
unignore config/database.js