const express = require('express')
var cors = require('cors')
const app = express()
const { exec } = require("child_process");
const bodyParser = require('body-parser')

var corsOptions = {
  origin: 'https://curieux.ma',
  optionsSuccessStatus: 200
}

const port = 3001

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

var re = new RegExp("^0x\\w{40}$");

app.get('/getether/:destination', cors(corsOptions), (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let destination = req.params.destination;
    if (!re.test(destination)){
        return res.status(550).json({"response": destination});
    }
    exec("geth attach /home/ethereum/distributor/data/geth.ipc --exec \"eth.sendTransaction({ from: '0xF72eF0d377515c11056660be5D65A3B407095254', to: '" + destination + "', value: '1000000000000000000', gasPrice: '8000000' }, function(err, receipt) { console.log(receipt) ; });\"", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return res.status(550).json(error.message);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return res.status(550).json(stderr);
        }
        return res.status(200).json({"response": stdout});
    });
});

app.listen(port, () => {
    console.log("Running")
})