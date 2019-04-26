
const cheerio = require('cheerio');
const request = require('request');
const mkdirp = require('mkdirp');

const path = require('path');
const fs = require('fs-extra');
const _ = require('underscore');
const express = require('express');
const app = express();
var collector = [];
const port = process.env.PORT || 3000;
var server = app.listen(port,console.log('server up'));

app.get('/',(req,res)=>{
    app.set('view engine', 'ejs');
res.render('index.ejs',{mainArray:mainArray});

})


var interval = setInterval(function () {
    dataBase1();
    dataBase2();
    dataBase3();
    dataBase4();
    dataBase5();
    clearInterval(interval);
}, 100);

//main function 
var dataBase1 = function (collection) {
    var data = [];
    var key = [];
    request('https://finviz.com/quote.ashx?t=AAPL', (error, res, html) => {
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
            var ar = {};
            //Saving data to Array with index created by key array
            for (i = 0; i < key.length; i++) {
                ar[key[i]] = data[i];
            }
            //   console.log({jsonFile});
            fileCreator({ ar })
        } else console.log('\t\t\t' + element + ' Stock not exist in Finviz');

    });
};
var dataBase2 = function (collection) {
    var data = [];
    var key = [];
    request('https://finviz.com/quote.ashx?t=FB', (error, res, html) => {
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
            var br = {};
            //Saving data to Array with index created by key array
            for (i = 0; i < key.length; i++) {
                br[key[i]] = data[i];
            }
            //  console.log({jsonFile});
            fileCreator({ br })
        } else console.log('\t\t\t' + element + ' Stock not exist in Finviz');

    });
};
var dataBase3 = function (collection) {
    var data = [];
    var key = [];
    request('https://finviz.com/quote.ashx?t=TWTR', (error, res, html) => {
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
            var cr = {};
            //Saving data to Array with index created by key array
            for (i = 0; i < key.length; i++) {
                cr[key[i]] = data[i];
            }
            //   console.log({jsonFile});
            fileCreator({ cr })
        } else console.log('\t\t\t' + element + ' Stock not exist in Finviz');

    });
};
var dataBase4 = function (collection) {
    var data = [];
    var key = [];
    request('https://finviz.com/quote.ashx?t=MSFT', (error, res, html) => {
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
            var dr = {};
            //Saving data to Array with index created by key array
            for (i = 0; i < key.length; i++) {
                dr[key[i]] = data[i];
            }
            //   console.log({jsonFile});
            fileCreator({ dr })
        } else console.log('\t\t\t' + element + ' Stock not exist in Finviz');

    });
};
var dataBase5 = function (collection) {
    var data = [];
    var key = [];
    request('https://finviz.com/quote.ashx?t=WWE', (error, res, html) => {
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
            var er = {};
            //Saving data to Array with index created by key array
            for (i = 0; i < key.length; i++) {
                er[key[i]] = data[i];
            }
            //  console.log({jsonFile});
            fileCreator({ er })
        } else console.log('\t\t\t' + element + ' Stock not exist in Finviz');

    });
};


var fileCreator = function (jsonFile) {
    collector.push(jsonFile);    
    if (collector.length == 5) {
        let mainArray = {};
        console.log('\t Writing the file! ');
        _.map(collector, function (elem) {
            _.mapObject(elem, function (val, key) {
                mainArray[key] = val;
            })
        })
        console.log(mainArray);
        sorter(mainArray);
    }

}

function sorter(mainArray) {
    fs.writeFileSync('./dirPath.json', JSON.stringify(mainArray), err => {
        console.log('\t file saved')
        if (err) throw err;
    });
};
