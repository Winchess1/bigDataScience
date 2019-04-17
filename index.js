const express = require('express');
const app = express();
const request = require('request');
const fs = require('fs-extra');
var dateFormat = require('dateformat');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const path = require('path');
var walk = require('walk');
// const callback = require('./index2.js');

const port = process.env.PORT || 3000;
app.listen(port, console.log('server up'));

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
};

/*

1 - request list of stockes
2 - look at data in folder
3 - exclude all that are loaded and stored in folders
4 - load thouse who left

*/


// copy paste form https://gist.github.com/kethinov/6658166
// List all files in a directory in Node.js recursively in a synchronous fashion
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
            filelist.push(file);
        }
    });
    return filelist;
};
// helper function
function createIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
        // mk dirs - make all dirs  
        fs.mkdirsSync(dir);
    }
}

// helper function
function getStockDir(symbol) {
    var letter = symbol[0].toLowerCase()
    return path.join('data', date, letter);
}

// helper function
function getListOfSymbols(pathDir) {
    if (!fs.existsSync(pathDir)){
        return []
    }
    let files = walkSync(pathDir)
    var ret = {}
    files.forEach((x) => {
        let symbol = path.basename(x).split('.')[0]
        ret[symbol] = true;
    })
    return ret;
}

request(allStocks, function (error, response, body) {
    savedSymbols = getListOfSymbols(path.join('data', date));
    console.log("\tgrabbing and extracting the Stocks from API");
    collection = _.map(_.filter(body, function (data) {


        return data['type'] !== 'et' && data['type'] !== 'N/A' && typeof(savedSymbols[data.symbol]) === "undefined";
    }),
        function (data) {
            return data.symbol
        });
/*
    let stockNameFisrtLetter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    _.map(stockNameFisrtLetter, function (data) {
        if (!(fs.existsSync(date + '/' + data + '/'))) {
            mkdirp(date + '/' + data + '/', function (err) {
                if (err) console.error(err)
                else console.log(data + ' folder is created')
            });
        }

    });
*/

    console.log("\tSaved on disk:", Object.keys(savedSymbols).length)
    console.log("\tTo load:", collection.length)

    var interval = setInterval(() => {
        count(collection.pop())
        if (collection.length == 0) {
            console.log(">>>>>>>>>>>>>ALL DONE!!!!<<<<<<<<<<<")
            console.log("exit in 3 seconds")
            setTimeout(()=>{
                console.log("Buy")
                process.exit()
            }, 3)
            clearInterval(interval)
        }
    }, 100)
/*
    for (x = 0; x < collection.length; x++) {
        count(collection[x]);
    }
*/
});

function count(collection) {
    request('https://finviz.com/quote.ashx?t=' + collection, (error, res, html) => {
        console.log(collection + ' Stock in action')
        if (error) {
            console.log(collection + ' ERROR')
            console.log(error)
            return
        }

        if (res.statusCode != 200) {
            console.log(collection + ' Response is' + res.statusCode)
            return
        }

            const $ = cheerio.load(html);

            // let stockNameFisrtLetterTemp = collection.charAt(0);
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

            var symbolDir = getStockDir(collection);
            createIfNotExists(symbolDir)

            var symbolPath = path.join(symbolDir, collection + '.json');

            fs.writeFile(symbolPath, JSON.stringify(jsonFile), function (err) {
                console.log('\t\t' + symbolPath + ' file saved')
                if (err) throw err;
            })

            /*
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


            }*/
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

