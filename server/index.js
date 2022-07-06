const express = require("express");
const cors = require("cors");
const moonbirds = require("./moonbirdsOwners");
const moonbirdsH = require("./moonbirdsHistory");
const bayc = require("./baycOwners");
const baycH = require("./baycHistory");
const azuki = require("./azukiOwners");
const azukiH = require("./azukiHistory");
const punk = require("./punkOwner");
const punkH = require("./punkHistory");
const coolcat = require("./coolcatOwners");
const coolcatH = require("./cooclcatHistory");
const goblin = require("./goblinOwners");
const goblinH = require("./goblinHistory");


const collections = {
    "0x23581767a106ae21c074b2276D25e5C3e136a68b":{
        owners: moonbirds,
        history: moonbirdsH,
    },
    "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D":{
        owners: bayc,
        history: baycH,
    },
    "0xED5AF388653567Af2F388E6224dC7C4b3241C544":{
        owners: azuki,
        history: azukiH,
    },
    "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB":{
        owners: punk,
        history: punkH,
    },
    "0x1A92f7381B9F03921564a437210bB9396471050C":{
        owners: coolcat,
        history: coolcatH,
    },
    "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e":{
        owners: goblin,
        history: goblinH,
    },
}

const app = express();
const port = 4000;

app.use(cors());

app.get("/", (req, res) => {
    res.send("Welcome to NFT Whale Radar server!");
});

app.get("/collection", (req, res) => {
    const slug = req.query.slug;
    res.send(collections[slug].owners);
})

app.get("/user", (req, res) => {
    const slug = req.query.slug;
    const address = req.query.address;
    res.send(collections[slug].history[address]);
})

app.listen(port, () => 
    console.log(`Whale Radar is running on ${port}`)
);
