const Moralis = require("moralis/node");
const fs = require("fs");

const serverUrl = "https://6ywgh9hjrfzw.usemoralis.com:2053/server";

const appId = "La9i3WGD2lmbGKAXljooxwKjcpyBg9GK8rZDlYby";

const contractAddress = "0xbCe3781ae7Ca1a5e050Bd9C4c77369867eBc307e" //NFT token Contract, change the Contract Address here

Array.prototype.getUnique = function() {
    var uniques = [];
    for(var i = 0, l = this.length; i < l; ++i) {
        if(this.lastIndexOf(this[i]) == this.lastIndexOf(this[i])) {
            uniques.push(this[i]);
        }
    }
    return uniques
}

const averagePrice = (array) => {
    const filteredZero = array.filter(item => item !== 0);
    const filtered = filteredZero.getUnique();

    if(filtered.length > 1){
        return (filtered.reduce((a, b) => Number(a) + Number(b)) / filtered.length) / 1e18;
    } else if(filtered.length === 1){
        return filtered[0] / 1e18;
    } else {
        return 0;
    } 
}

const averageDaySinceBuy = (array) => {
    let ms;

    if(array.length > 1) {
        ms = array.reduce((a, b) => new Date(a).getTime() + new Date(b).getTime()) / array.length;
    } else {
        ms = new Date(array[0]).getTime()
    }

    const diff = Math.floor((new Date().getTime() - ms) / 86400000) ;

    return diff
}
 
async function getAllOwners() {

    await Moralis.start({ serverUrl: serverUrl, appId: appId });
    let cursor = null;
    let owners = {};
    let history = {};
    let res;
    let accountedTokens = [];

    let date = new Date();

    date.setDate(date.getDate() - 30);

    const blockOptions = {
        chain: "Eth",
        date: date,
    };

    const block = await Moralis.Web3API.native.getDateToBlock(blockOptions);
    const monthBlock = Number(block.block);


    do {

        const response = await Moralis.Web3API.token.getContractNFTTransfers({
            address: contractAddress,
            chain: "eth",
            limit: 100,
            cursor: cursor,
        });

        res = response;
        console.log(
            `Got Page ${response.page} of ${Math.ceil(response.total / response.page_size)}, ${response.total} total`
        );
        
        for (const transfer of res.result) {

            let recentTx = 0;
            if(monthBlock < Number(transfer.block_number)){
                recentTx = 1;
            }

            if (!owners[transfer.to_address] && !accountedTokens.includes(transfer.token_id)) {

                owners[transfer.to_address] = {
                    address: transfer.to_address,
                    amount: Number(transfer.amount),
                    tokenId: [transfer.token_id],
                    prices: [Number(transfer.value)],
                    dates: [transfer.block_timestamp],
                    recentTx: recentTx,
                    avgHold: averageDaySinceBuy([transfer.block_timestamp]),
                    avgPrice: Number(transfer.value) / 1e18,
                }

                accountedTokens.push(transfer.token_id);

            } else if(!accountedTokens.includes(transfer.token_id)) {

                owners[transfer.to_address].amount++;
                owners[transfer.to_address].tokenId.push(transfer.token_id);
                owners[transfer.to_address].prices.push(Number(transfer.value));
                owners[transfer.to_address].dates.push(transfer.block_timestamp);
                owners[transfer.to_address].recentTx = owners[transfer.to_address].recentTx + recentTx;
                owners[transfer.to_address].avgHold = averageDaySinceBuy(owners[transfer.to_address].dates);
                owners[transfer.to_address].avgPrice = averagePrice(owners[transfer.to_address].prices);

                accountedTokens.push(transfer.token_id);

            }

            if(owners[transfer.from_address] && recentTx === 1) {
                owners[transfer.from_address].recentTx = owners[transfer.from_address].recentTx - recentTx;
            } else if (!owners[transfer.from_address] && recentTx === 1) {
                owners[transfer.from_address] = {
                    address: transfer.from_address,
                    amount: 0,
                    tokenId: [],
                    prices: [],
                    dates: [],
                    recentTx: - recentTx,
                    
                };
            }

            if(!history[transfer.to_address]) {
                history[transfer.to_address] = [
                    {
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.tokenId,
                    },
                ]
            } else {
                history[transfer.to_address].push(
                    {
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.tokenId,
                })
            }

            if(!history[transfer.from_address]) {
                history[transfer.from_address] = [
                    {
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.tokenId,
                    },
                ]
            } else {
                history[transfer.from_address].push(
                    {
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.tokenId,
                })
            }


        }

        cursor = res.cursor

    } while (cursor != "" && cursor != null);

    const jsonContentOwners = JSON.stringify(owners);
    const jsonContentHistory = JSON.stringify(history);

    //Change the writeFile name into desired owners file name, ex: coolcatOwners.json
    fs.writeFile("goblinOwners.json", jsonContentOwners, "utf8", function (err) {
        if (err) {
            console.log("An error occured while writting JSON object to file");
            return console.log(err)
        }
        console.log("JSON file has been saved.");
    });
    //Change the writeFile name into desired history file name, ex: coolcatOwners.json
    fs.writeFile("goblinHistory.json", jsonContentHistory, "utf8", function (err) {
        if (err) {
            console.log("An error occured while writting JSON object to file");
            return console.log(err)
        }
        console.log("JSON file has been saved.");
    });


}

getAllOwners();