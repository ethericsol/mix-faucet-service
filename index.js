// index.js

// BASE SETUP
// =============================================================================

// call the packages we need
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');
const config     = require('./config');
const faucet     = require('./controllers/faucet.js');
const Donation   = require('./models/Donation.js');
const errors     = require('./errorReponses.js');
const Error      = require('./models/Error.js');
const cors       = require('cors');
const axios      = require('axios');

const mongoose   = require('mongoose');
try{    
    mongoose.connect(config.mongoDbConnection, { useNewUrlParser: true }); // connect to our database
} catch(e) {

}

// configure app to use bodyParser()
// this will let us get the data from a POST

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8083;        // set our port

// ROUTES FOR OUR API
// =============================================================================
//const router = express.Router();  
        // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// get balance of faucet
app.get('/getBalance', async function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' }); 
});

// send mix to address provided corrent captcha
app.options('/getMix', cors()) // enable pre-flight request 
app.post('/getMix', cors(), async function(req, res) {

    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let _captchaRequest = req.body.captcha;
    let isAddr = false;
    let _toAddr;
    try {
        _toAddr = faucet.toCheckSum(req.body.toAddr);
        isAddr = faucet.isAddress(_toAddr);
    } catch (e) {
        res.status(400).send(e);
    }

    if(!_toAddr || !_captchaRequest || !isAddr) {
        res.status(400).end();
    };
    console.log(_captchaRequest)
    
    let url = 'https://www.google.com/recaptcha/api/siteverify?secret='+ config.captchaSecretKey +'&response='+ _captchaRequest;
    axios.post(url, {},
        {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
        })
      .then(async function (response) {

        let donation = new Donation();
        donation.toAddr = String(_toAddr);
        donation.time = new Date();
        donation.amount = config.donationAmount;
        donation.ip = String(ip);
        
        let error = new Error();
        error.toAddr = String(_toAddr);
        error.time = new Date();
        error.ip = String(ip);

        let eightHoursAgo = new Date();
        eightHoursAgo.setHours(eightHoursAgo.getHours() - 8);

        if(response.data.success) {
            try {
                
                if(await Donation.countDocuments({ toAddr:{ $eq: donation.toAddr }}) > 0) {
                    console.log('used Addr');
                    error.errorMessage = errors.addressUsed.message;
                    error.save((err)=>{if(err) console.log(err)});

                    res.status(403).send(errors.addressUsed);

                } else if (await Donation.countDocuments({ ip: { $eq: donation.ip }}) > 3) {
                    console.log('used Ip');
                    error.errorMessage = errors.ipUsed.message;
                    error.save((err)=>{if(err) console.log(err)});

                    res.status(403).send(errors.ipUsed);

                } else if (await Donation.countDocuments({ time: { $gte: eightHoursAgo }}) > config.donationsPer8Hrs) {
                    console.log('8hrs exceded')
                    error.errorMessage = errors.dayLimit.message;
                    error.save((err)=>{if(err) console.log(err)})
                    
                    res.status(403).send(errors.dayLimit);

                }
                else{  
                    console.log('sending...')
                    faucet.donateTo(donation.toAddr).then(txHash=>{
                        
                        donation.txHash = String(txHash)
                        donation.save(function(err) {
                            if (err) res.send(err);
    
                            res.json({ message: 'donation created!', txHash: txHash});
                        });

                    }).catch(e=>{
                        res.status(403).send(e);
                    })

                }
            } catch(err) {
                res.send(err);
            }
        } else {

            res.status(403).send(errors.failedCaptcha)
        }

      })
      .catch(function (error) {
        console.log(error);
      });

    
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Service running on port: ' + port);
//console.log(config.publicAddr);
