const request = require('request');
const fs = require('fs-extra');
var dateFormat = require('dateformat');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const path = require('path');
var date = dateFormat(new Date(), "yyyymmdd");
const cheerio = require('cheerio');
var folders = [];

/* 
Check the repositories
Get a first stock
Parser to array

*/
const genPath = path.join(__dirname, 'data', date);

var step1 = function () {
    fs.readdir(genPath, (err, directorys) => {
        directorys.forEach((file, i) => {
            folders.push(path.join(genPath, file));
        });
    });
    
}

var step2 = function (path) {
    //folders2[folders[i]] = new Array(); 1
   
    fs.readdir(path, (err, files) => {
       // console.log(files);
          folders[path] = _.map(files, function (num, key) {
         //   console.log(folders);
            return num;
        })    
        
    });
    
}

var interval = setInterval(function () {
    step2(folders.shift());   
    switch(folders.length){
        case 0:
        clearInterval(interval);
        console.log('\ttask was done!');
        console.log(typeof(folders));
        step3 (folders);
        break;
    }

}, 100);

step3 = function (folders) {  
    async function example () {
        try {
          await fs.writeJson('./package.json',folders)
          console.log('success!')
        } catch (err) {
          console.error(err)
        }
      }
      
      example()
 
/*   fs.writeJson('./rest.json',folders, function (err) {
        console.log('\t\t file saved')
        if (err) throw err;

    }); */
}




/*   step3(folders2); 

  var step3 = function(folders2){
  for(var i = 0;i<2;i++){
    folders[folders[i]]=folders2[i];
  }

  console.log(folders); 
  } */
/* var step2 = function(){
  fs.readdir(folders[0], (err, files) => {
    files.forEach((file)=> {      
        folders[0].push(file);        
    });
    console.log(folders);
  });

} */

step1();
