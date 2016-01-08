# SAP Security booth

## Usage

### Prerequisites  
1) mongo  - `https://www.mongodb.org/downloads`   
2) nodejs - `https://nodejs.org/en/`  
3) bower  - `npm install -g bower`   

### Run in localhost

1) run `npm install`  
2) cd web and `bower install`   
3) run `mongod.exe`   
4) run `node server.js`    
5) Goto `http://localhost:3000/#/login`    

### Change user level during development   
1) run mongo.exe       
2) run command: `use appname`    
3) run command:   
`db.users.update(    
    { "lastName" : "a" },    
    {    
      $set: { "game.level": "1" }   
    }   
)`  
4) other commands:   
`db.users.find()`     
`db.dropDatabase()`      

### Deploy to cloud

#### Mongo service 
In MongoLab I created account for free and received 0.5GB of storage.   
WebSite - `https://mongolab.com/home`   
Local connection from shell: `mongo ds035975.mongolab.com:35975/security-booth-db -u <dbuser> -p <dbpassword>`   
Remote connection: `mongodb://<dbuser>:<dbpassword>@ds035975.mongolab.com:35975/security-booth-db`    
dbuser, dbpassword known to me only, also login to my account setting is known to me only.   

#### Heroku - hosting the nodeJS application
Basic usage of Heroku is free. Each app you create has free access to 750 dyno-hours per month.   
WebSite - `https://dashboard.heroku.com/apps`    
I created an account and deployed from there.   
The deployment is from other cloned git, because SAP's github is not recognized there. 
(manually step to copy-paste - Don't override the database.js)!!!    
