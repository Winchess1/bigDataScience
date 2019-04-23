const dateFormat = require('dateformat');
const request = require('request');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');
const date = dateFormat(new Date(), "yyyymmdd");
const cheerio = require('cheerio');

// Function that reads the Data folder to find any subfolders that contains the files
function directoryCollector() {
    //path to the Data folder
    const genPath = path.join(__dirname, 'data', date);
    var folders = [];
    var directorys = fs.readdirSync(genPath);
    //saving the folders to the array
    directorys.forEach((file, i) => {
        folders.push(path.join(genPath, file));
    });
    return folders;

}

// Function that reads all Stock files and create big object. 
function namedCollector() {
    const dirCollect = directoryCollector();
    var dirFullPath = [];
    //saving the Stock files to the big object.
     _.forEach(dirCollect, function (file) {      
        dirFullPath[file] =fs.readdirSync(file);         
    });
    return dirFullPath  ;
};

// Temp file just to take a look at JSOn in the file
(function tempJSON(){
var temp = namedCollector();
console.log(temp);
    fs.writeFileSync('./resto.json',temp);

})();
// !!!!!!!!!!!!! не сохраняет данные в файл!!!!!!!!!!!!!!!!!!!!!!

