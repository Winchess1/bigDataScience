const dateFormat = require('dateformat');
const cheerio = require('cheerio');
const request = require('request');
const mkdirp = require('mkdirp');
const date = dateFormat(new Date(), "yyyymmdd");
const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');

const allStocks = {
    url: `https://api.iextrading.com/1.0/ref-data/symbols`,
    json: true,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
}

//requesting for Stock list
request(allStocks, function (error, res, body) {
    if (!error && res.statusCode == 200) {
        console.log("\Scrapping and extracting the Stocks from API");
        collection = _.map(_.filter(body, data => {
            return data['type'] !== 'et' && data['type'] !== 'N/A';
        }),
            function (data) {
                return data.symbol
            });
        //Going through Array Stock list removing by one (.pop()) and sending to count function
        count(collection);
    } else console.error("Something wrong with API " + error)
});

//main function 
function count(collection) {
    var data = [];
    var key = [];
    //requesting Finviz website to scrap Stock info
    var dataCollector = [];
    console.log('\tSaving the files, may take a while')
    collection.forEach(element => {
        request('https://finviz.com/quote.ashx?t=' + element, (error, res, html) => {
            if (!error && res.statusCode == 200) {

                const $ = cheerio.load(html);

                //scrapping infromation from website and save it to the arrays
                $('.table-dark-row .snapshot-td2-cp').each((i, el) => {
                    key[i] = $(el).text();
                });
                $('.table-dark-row .snapshot-td2').each((i, el) => {
                    data[i] = $(el).text();
                });
                //Temp array that save the current info from the Stock
                var jsonFile = {};
                //Saving data to Array with index created by key array
                for (i = 0; i < key.length; i++) {
                    jsonFile[key[i]] = data[i];
                }

                //passing the Path to the dirCheck function to check if Symfol Dirs are existing if not create 'em
                dirCheck(path.join('data', date, symbol(element)));

                //Variable that saves current Path fro futher checking in fileCreator function
                var dirPath = path.join('data', date, symbol(element), element + '.json');

                //Passing the Path, Stock Symbol, Grabbed Info from Finviz
                fileCreator(dirPath, element, jsonFile);

            } else console.log('\t\t\t' + element + ' Stock not exist in Finviz')

        }
        )
    });



}

//Symbol checker
var symbol = function (symbolExtractor) {
    var symbolPath = symbolExtractor.charAt(0);
    return symbolPath;
}

//creating Directories
var dirCheck = function (fileSymbol) {
    if (!(fs.existsSync(fileSymbol))) {
        console.log('dirCheck ' + fileSymbol);
        fs.mkdirsSync(fileSymbol, err => {
            if (err) console.error(err)
            else console.log('\t\t' + fileSymbol + ' folder is created')
        });

    } else (console.log('\t\t\t' + fileSymbol + ' Directory exist'))
}

//Creating Files
var fileCreator = function (dirPath, collection, jsonFile) {
    if (!(fs.existsSync(dirPath))) {
        console.log('\t Writing the file! ' + collection);
        fs.writeFileSync(dirPath, JSON.stringify(jsonFile), err => {
            console.log('\t\t' + collection + ' file saved')
            if (err) throw err;

        });

    } else (console.log('\t\t\t' + collection + 'File exist'))

}
