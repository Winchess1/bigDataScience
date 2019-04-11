const express = require('express');
const app = express();
const request = require('request');
const fs = require('fs-extra');
var dateFormat = require('dateformat');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const path = require('path');

//const port = process.env.PORT || 3000;
//app.listen(port, console.log('server up'));
app.set('view engine', 'ejs');
var date = dateFormat(new Date(), "yyyymmdd");
const cheerio = require('cheerio');
var data = [];
var key = [];
var counter = 0;


//requesting for Stock list
const allStocks = {
    url: `https://api.iextrading.com/1.0/ref-data/symbols`,
    json: true,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
}
request(allStocks, function (error, res, body) {
    if (!error && res.statusCode == 200) {
        console.log("\tgrabbing and extracting the Stocks from API");
        collection = _.map(_.filter(body, function (data) {
            return data['type'] !== 'et' && data['type'] !== 'N/A';
        }),
            function (data) {
                return data.symbol
            });
        //Awesome timer for Arrays
        var interval = setInterval(function () {
            count(collection.pop());
            if (collection.length == 0) {
                clearInterval(interval);
                console.log('\ttask was done!');
                console.log('\ttotal valid stocks = ' + counter)
            }
        }, 50);
    } else console.log("Something wrong with API " + error)
});

function count(collection) {
    request('https://finviz.com/quote.ashx?t=' + collection, (error, res, html) => {
        if (!error && res.statusCode == 200) {
            console.log(collection + ' Stock in action')
            const $ = cheerio.load(html);

            let stockNameFisrtLetterTemp = collection.charAt(0);

            $('.table-dark-row .snapshot-td2-cp').each((i, el) => {
                key[i] = $(el).text();

            });
            $('.table-dark-row .snapshot-td2').each((i, el) => {
                data[i] = $(el).text();

            });
            var jsonFile = {};

            for (i = 0; i < key.length; i++) {
                jsonFile[key[i]] = data[i];
            }

            var temp = symbol(collection);
            dirCheck(temp);

            fileCreator(collection, temp, jsonFile);

            counter++;

        } else console.log('\t' + collection + 'Stock not exist in Finviz')

    }
    )

}

//Symbol checker
var symbol = function (symbolExtractor) {
    var symbolPath = symbolExtractor.charAt(0);
    return symbolPath;
}

//creating a directories
var dirCheck = function (fileSymbol) {

    if (!(fs.existsSync(path.join(date, fileSymbol)))) {

        mkdirp(path.join(date, fileSymbol), function (err) {
            if (err) console.error(err)
            else console.log('\t\t' + fileSymbol + ' folder is created')
        });

    } else (console.log(fileSymbol + ' Directory exist'))
}
//creating files
var fileCreator = function (collection, temp, jsonFile) {
    if (!(fs.existsSync(path.join(date, temp, collection + '.json')))) {
        console.log(path.join(date, temp, collection + '.json'));
        console.log('\t Writing the file! ' + collection);
        fs.writeFile(path.join(date, temp, collection + '.json'), JSON.stringify(jsonFile), function (err) {
            console.log('\t\t' + collection + ' file saved')
            if (err) throw err;

        });

    } else (console.log(collection + 'File exist'))

}
