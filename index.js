const request = require('request');
const fs = require('fs-extra');
var dateFormat = require('dateformat');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const path = require('path');
const cheerio = require('cheerio');

var date = dateFormat(new Date(), "yyyymmdd");
var data = [];
var key = [];
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
        console.log("\tGrabbing and extracting the Stocks from API");
        collection = _.map(_.filter(body, function (data) {
            return data['type'] !== 'et' && data['type'] !== 'N/A';
        }),
            function (data) {
                return data.symbol
            });
        //Going through Array Stock list removing by one (.pop()) and sending to count function
        var interval = setInterval(function () {
            count(collection.pop());
            if (collection.length == 0) {
                console.log('\ttask was done!');           
                clearInterval(interval);
            }
        }, 100);
    } else console.log("Something wrong with API " + error)
});

//main function 
function count(collection) {
    //requesting Finviz website to scrap Stock info
    request('https://finviz.com/quote.ashx?t=' + collection, (error, res, html) => {
        if (!error && res.statusCode == 200) {
            console.log(collection + ' Stock in action')
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
            dirCheck(path.join('data', date, symbol(collection)));

            //Variable that saves current Path fro futher checking in fileCreator function
            var dirPath = path.join('data', date, symbol(collection), collection + '.json');

            //Passing the Path, Stock Symbol, Grabbed Info from Finviz
            fileCreator(dirPath, collection, jsonFile);

        } else console.log('\t' + collection + 'Stock not exist in Finviz')

    }
    )

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
        fs.mkdirsSync(fileSymbol, function (err) {
            if (err) console.error(err)
            else console.log('\t\t' + fileSymbol + ' folder is created')
        });

    } else (console.log(fileSymbol + ' Directory exist'))
}

//Creating Files
var fileCreator = function (dirPath, collection, jsonFile) {
    if (!(fs.existsSync(dirPath))) {

        console.log('\t Writing the file! ' + collection);
        fs.writeFile(dirPath, JSON.stringify(jsonFile), function (err) {
            console.log('\t\t' + collection + ' file saved')
            if (err) throw err;

        });

    } else (console.log(collection + 'File exist'))

}
