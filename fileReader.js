const dateFormat = require('dateformat');
const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');
const date = dateFormat(new Date(), "yyyymmdd");
const data_path = process.env.DATAPATH || path.join(__dirname, 'data');
const statistics_var_path = path.join(process.env.OUTPATH || __dirname, 'statisticVar.json');
const statistics_count_path = path.join(process.env.OUTPATH || __dirname, 'statisticCount.json');

// Function that reads the Data folder to find any subfolders that contains the files
function directoryCollector(genPath) {
    console.log(genPath)
    var walkSync = function (dir, filelist) {
        var path = path || require('path');
        var fs = fs || require('fs'),
            files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = walkSync(path.join(dir, file), filelist);
            }
            else {
                filelist.push(dir + '/' + file);
            }
        });
        return filelist;
    };
    return walkSync(genPath);
}

//Filter that will scan everythin and calculate most value items
function analyze(data_path) {
    var dirFullPath = directoryCollector(data_path);
    //Variable that stores the results
    var statisticVar = {};
    var statisticCount = {};
    //Crating the some kind of constructors
    for (const key of Object.keys(JSON.parse(fs.readFileSync(dirFullPath[0])))) {
        statisticVar[key] = [];
        statisticCount[key] = 0;
    }

    console.log('Reading the files and collecting information');
    //Processing each folder and increasing the cont for each Key of the object
    dirFullPath.forEach((filePath) => {
        console.log('\t\t' + filePath);
        //reading all paths
        try {

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
        } catch (error) {
            return
        }
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

    //Passing result to the file
    console.log('Saving results for SQL Db')
    saveResultVar(statisticVar);

    console.log('Saving results amount of values')
    savestatisticCount(statisticCount);
}
analyze(path.join(data_path));
//Saving the result for SQL formats
function saveResultVar(statisticVar) {
    fs.writeFileSync(statistics_var_path, JSON.stringify(statisticVar, space = 4));
    console.log('StatisticVar Finished')
}
//Saving the result for amount of values for each Item
function savestatisticCount(statisticCount) {
    fs.writeFileSync(statistics_count_path, JSON.stringify(statisticCount, space = 4));
    console.log('StatisticCountFinished')
}


