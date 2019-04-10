const express = require('express');
const app = express();
const request = require('request');
const fs = require('fs-extra');
var dateFormat = require('dateformat');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const callback = require('./index2.js');

//const port = process.env.PORT || 3000;
//app.listen(port, console.log('server up'));
app.set('view engine', 'ejs');
var date = dateFormat(new Date(), "yyyymmdd");
const cheerio = require('cheerio');
var data = [];
var key = [];
var bigData = [];
var counter = 0;

const allStocks = {
    url: `https://api.iextrading.com/1.0/ref-data/symbols`,
    json: true,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
}
request(allStocks, function (error, response, body) {
    console.log("\tgrabbing and extracting the Stocks from API");
    collection = _.map(_.filter(body, function (data) {


        return data['type'] !== 'et' && data['type'] !== 'N/A';
    }),
        function (data) {
            return data.symbol
        });

    let stockNameFisrtLetter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    _.map(stockNameFisrtLetter, function (data) {
        if (!(fs.existsSync(date + '/' + data + '/'))) {
            mkdirp(date + '/' + data + '/', function (err) {
                if (err) console.error(err)
                else console.log(data + ' folder is created')
            });
        }

    });
    for (x = 0; x < collection.length; x++) {
        count(collection[x]);
    }
});
function count(collection) {

    request('https://finviz.com/quote.ashx?t=' + collection, (error, res, html) => {
        console.log(collection + ' Stock in action')
        if (!error && res.statusCode == 200) {

            const $ = cheerio.load(html);

            let stockNameFisrtLetterTemp = collection.charAt(0);
            console.log('Collecting info')
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

            bigData[collection] = jsonFile;



            counter++;
            console.log(counter);
            if (counter == 7553) { starto() }

            function starto() {

                _.mapObject(bigData, function (val, key) {
                    console.log('\t Writing the file! ' + key);
                     fs.writeFile(date + '/' + key.charAt(0) +'/'+key+ '.json', val, function (err) {

                        console.log('\t\t'+key+ 'file saved')
                        if (err) throw err;

                    }); 

                })


            }
        }


    }
    )

}





/* getIextrading.getIextrading(function (stocks) {
    console.log('rendering the page')
    res.render('main', { allStocks: stocks }, console.log("page is loaded"));
}) */

/* app.get('/', (req, res) => {

    res.render('index',console.log('Get page is loadd'))

}); */

