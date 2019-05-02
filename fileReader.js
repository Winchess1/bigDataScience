const dateFormat = require('dateformat');
const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');
const date = dateFormat(new Date(), "yyyymmdd");

// Function that reads the Data folder to find any subfolders that contains the files
function directoryCollector() {
    console.log('Reading the files and colecting the Statistic')
    //path to the Data folder
    const genPath = path.join(__dirname, 'data', date);
    var folders = [];
    var dirFullPath = [];

    var directorys = fs.readdirSync(genPath);
    //saving the folders to the array
    directorys.forEach((file) => {
        folders.push(path.join(genPath, file));

    });
    folders.forEach((dir) => {
        filePath = fs.readdirSync(dir)
        filePath.forEach((file) => {
            dirFullPath.push(path.join(dir, file));
        });
    });

    //saving the Stock files to the big object.
    return dirFullPath;
}

//Filter that will scan everythin and calculate most value items
function filter() {
    var dirFullPath = directoryCollector();
    //Variable that stores the results
    var statisticVar = {};
    //Crating the some kind of constructor
    for (const key of Object.keys(JSON.parse(fs.readFileSync(dirFullPath[0])))) {
        statisticVar[key] = 0;
    }
    console.log('Reading the files and collecting information');
    //Processing each folder and increasing the cont for each Key of the object
    dirFullPath.forEach((filePath) => {
        console.log('\t\t' + filePath);
        let fileToCheck = JSON.parse(fs.readFileSync(filePath));
        _.mapObject(fileToCheck, (val, key) => {
            if (val != '-') {
                statisticVar[key] = statisticVar[key] + 1;
            }
        });

    });
 //Passing result to the file
    saveResult(statisticVar);
}
filter();
//Saving the result
function saveResult(statisticVar) {
    fs.writeFileSync('./results/statistic.json', JSON.stringify(statisticVar));
    console.log('Finished')


}


