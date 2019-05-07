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
function analyze() {
    var dirFullPath = directoryCollector();
    //Variable that stores the results
    var statisticVar = {};
    var statisticCount = {};
    //Crating the some kind of constructors
    for (const key of Object.keys(JSON.parse(fs.readFileSync(dirFullPath[0])))) {
        statisticVar[key] = [];
        statisticCount[key] = [];
    }

    console.log('Reading the files and collecting information');
    //Processing each folder and increasing the cont for each Key of the object
    dirFullPath.forEach((filePath) => {
        console.log('\t\t' + filePath);
        //reading all paths
        let fileToCheck = JSON.parse(fs.readFileSync(filePath));
        //Count amount of values for each position
        _.mapObject(fileToCheck, (val, key) => {
            if (val != '-') {
                statisticCount[key] = statisticCount[key] + 1;
            }
        });
        //Push all values to the constructor
        _.mapObject(fileToCheck, (val, key) => {
            statisticVar[key].push(val);
        });

    });

    for (key in statisticVar) {

        statisticVar[key] = _.map(statisticVar[key], function (array) {
            //replacing ',' cause it is Finviz format but it is still a numbers
            array = array.replace(/,/g, '');
            //Finding any numbers (integers or Float) and replacing it with SQL format that can be Used 
            if (!isNaN(parseFloat(array)) && isFinite(array) == true) {
                if (Number.isInteger(parseFloat(array))) {
                    return 'Integer number'
                }
                return 'Float number';
            }
            //Adding all undifined Data with Finviz format
            if (array == '-') {
                return array;

            }
            //Finds Ranges thet can be used as Float in the future should be divided to min and max
            if (array.includes(' - ')) {
                return 'Range (Float)';

            }
            //Find data with procents and replacing with Decimal format
            if (_.last(array) == '%') {

                return 'Decimal';
            }
            //Find any Booleans
            if (array == 'Yes' || array == 'No') {

                return array + ' Boolean'
            }
            //Finds data in number format with abbriviations such as M- million, B - billion, K- kilo 
            if (_.last(array) != isFinite(_.last(array)) && '%' && isNaN(_.last(array)) == true) {

                return 'Float Number ' + _.last(array);

            }
            //Return everything that were not formated such as Data
            return array;

        })
        //Return only uniq Values without duplicates
        statisticVar[key] = _.uniq(statisticVar[key]);
    }
    console.log(statisticVar)
    //Passing result to the file
    saveResultVar(statisticVar);
    saveResult(statisticCount);
}
analyze();
//Saving the result for SQL formats
function saveResultVar(statisticVar) {
    fs.writeFileSync('./statisticVar.json', JSON.stringify(statisticVar));
    console.log('StatisticVar Finished')
}
//Saving the result for amount of values for each Item
function statisticCount(statisticCount) {
    fs.writeFileSync('./statisticCount.json', JSON.stringify(statisticCount));
    console.log('StatisticCountFinished')
}


