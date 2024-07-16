const Moralis = require("moralis-v1/node");
const fs = require("fs");
// adding the packages we need: Moralis and File Storage

const serverUrl = "https://1amqtgnam6di.usemoralis.com:2053/server";
const appId = "PEUbbxutnQ8Aci603DsHvQjeicjDpC8zpvbZbloG";


const contractAddress = "0x23581767a106ae21c074b2276D25e5C3e136a68b";
// contract address of moonbirds (NFT Collection)

Array.prototype.getUnique = function(){
// used to add new methods/properties to array object
    var uniques = [];
    for(var i = 0, l = this.length; i < l; i++){
    // goes through array of prices
        if(this.lastIndexOf(this[i]) == this.indexOf(this[i])){
        /*"lastIndexOf" checks the index of the last occurence
         * of a value in the array. If the last occurence position
         * and recent occurence position match up, there are no duplicates
         * of that value.
         */
            uniques.push(this[i])
        }
    }
    return uniques;
}
/* The purpose of this function is to get rid prices that are the same.
 * For example, someone could have bought 4 NFTs for the same price in
 * 1 transaction. It is not necessary for us to take into account all
 * of those prices, because it was all in 1 transaction.
 * We are doing this so we can accurately figure out the average
 * purchasing price. These un - unique prices will clog up our
 * calculations for the average price. 
 */

const averagePrice = (array) => {
    const filteredZero = array.filter(item => item !== 0);
    /* remove all items in the array that are equal to 0
     * no point having them in our calucations since 
     * they equal nothing
     */

    const filtered = filteredZero.getUnique();
    // gets all unique price values, wtih no duplicates

    if(filtered.length > 1){
        return(filtered.reduce((a, b) => Number(a) + Number(b)) / filtered.length) / 1e18;
        // get average and divide by 1e18 to get price in Ethereum
    } else if(filtered.length === 1){
        return filtered[0]/1e18;
        // if there is only one item in the prices array, 
        // we return that price in ETH form
    }else {
        return 0;
    }
}
// this function gives us the average purchasing price for one owner





const averageDaySinceBuy = (array) => {
    let ms; // milliseconds, easier if we use this unit
    if(array.length > 1){
        ms = array.reduce((a,b) => new Date(a).getTime() + new Date(b).getTime()) / array.length;
        /* If our array length is bigger than 1, our ms variable will
         * get the average(using the reduce method) of each timestamp
         * in milliseconds. Reduce method adds values in the array
         * together. We get the average date NFTs are bought by dividng 
         * this sum by the total array length.
         */
    } else {
        ms = new Date(array[0]).getTime();
        /* if our array is less than 1, we set ms
         * to the first and only item in our array.
         * Remember our unit is in milliseconds.
         */
    }

    const diff = Math.floor((new Date().getTime() - ms) / 86400000);
    /* We divide the difference between today's date and 
     * the average date NFTs are bought by the number milliseconds in a day
     * to find the average day for holding an NFT.
    */

    // 86400000 is the milliseconds in 1 day
    return diff;
    
}
/* calculates the average day since a purchase has happened, 
 * takes in as an argument the array of purchase dates,
 * finds out how long these wallets have been holding their
 * NFTs for. 
 */

async function getAllOwners() {
    await Moralis.start({ serverUrl: serverUrl, appId: appId });
    // initialize Moralis

    let date = new Date();
    date.setDate(date.getDate() - 30);
    // we set the value "date" to 30 days ago/before

    const blockoptions = {
        chain: "Eth",
        date: date,
    }
    // blockoptions defines our chain to be Eth
    // and the date to be 30 days ago

    const block = await Moralis.Web3API.native.getDateToBlock(blockoptions);
    // waits for API to tell us which block got added 30 days ago

    const monthBlock = Number(block.block);
    /* the API gives us a ton of information after we call
     * this function/endpoint. We only want to know the block number.
     * We also cast the block to a number so it is easier to use. 
     */

    let cursor = null;
    // A cursor is pointer that points to which dataset we need
    // It will help point us to the specific page of transfers we 
    // need every API call

    /* NFT transfer end point takes cursor as an argument
     * When you call the endpoint after 100 transfers again, you 
     * need to use the cursor as an argument again. You will provide
     * the cursor(which is a result from the previous call).
     * You keep looping this value until you get all the transfers
     */

    let owners = {};
    // an object of owners to push owner addresses, + 
    // details on how many NFTs they have, etc.

    let history = {};
    // object of history with all the wallets
    // that have made transactions qithin NFT collection

    let res;
    // store the response for each of our API calls
    
    let accountedTokens = [];
    /* array for if a specific token id (NFT) has been transferred 
     * multiple times. Only the most recent transfer and the "to"
     * address will be set as the owner of that NFT. 
     */

    do {
        const response = await Moralis.Web3API.token.getContractNFTTransfers({
            address: contractAddress,
            chain: "eth",
            limit: 100,
            cursor: cursor,
        });

        res = response;
        /* Our response will wait for the Moralis Web3API to get
         * the contract NFT transfers for the contract address we set 
         * (Moonbirds Collection), The limit on transfers per call is
         * 100. 
         */

        console.log (
            `Got page ${response.page} of ${Math.ceil(
                response.total / response.page_size
            )}, ${response.total} total`
        );
        /* delivers a status update of the
         * page # we are on, calculates the total number of pages we will
         * have by dividing the total transfers by the size of one page
         * which is equal to 100 transfers. We also print the total transfers
         * we have. 
         */
        
        /* response.page, total and page_size are values the 
         * API call delivers back.
         */

        cursor = res.cursor;
        /* we update the cursor by setting it equal to the result the API 
         * call deliver which is another cursor value rather than null. 
         * This new cursor will point the API to the next transfers for 
         * the next call. 
         */

        for (const transfer of res.result) {
        // goes through each transfer in the result

                let recentTx = 0;
                // represents recent transactions

                if(monthBlock < Number(transfer.block_number)){
                    recentTx = 1;
                }
                /* If our the transfer's block number is bigger than
                 * the block number of the block made 30 days ago, 
                 * it means the block was recently made, or made within 30 days after
                 * the month block was made. The recenTx variable is incremented as a
                 * result.
                 */


                if (!owners[transfer.to_address] && !accountedTokens.includes(transfer.token_Id)) {
                /* if the "to address" is not in the owner object , meaning the "to address" is not an owner, 
                 * meaning the key, the address in this case, does not point to an NFT
                 * and if the token_id is not in the accounted token array, meaning 
                 * the token_id has not been transferred at all. The array helps us keep track of 
                 * the NFT token, its transfers and owners.
                 */

                    owners[transfer.to_address] = {
                        address: transfer.to_address,
                        amount: Number(transfer.amount), // how many of the specific tokens the owner owns
                        tokenId: [transfer.token_id], //token id pushed into an array
                        prices: [Number(transfer.value)], // casts price of NFT to number + psuhes it into array
                        dates: [transfer.block_timestamp],
                        recentTx: recentTx, // set if they have had any recent transactions 
                        avgHold: averageDaySinceBuy([transfer.block_timestamp]), 
                        // average day of holding an NFT(just one) is pushed to array
                        avgPrice: Number(transfer.value) / 1e18,
                        // average price calculated from 1 NFT transfer and converted to ETH form
                    }
                    /* Since we don't have an owner's object for the NFT from our API call, 
                     * we will create one with a KEY that points to the token's info.
                     */
                    // this to_address could also be a from_address

                    accountedTokens.push(transfer.token_id);
                    // Since this token is not in the array, it is added to it
                    // if any transfer of this NFT pop up from earlier history
                    // we won't go through it, because we already have an owner. 

                }else if (!accountedTokens.includes(transfer.token_id)) {
                    owners[transfer.to_address].amount++;
                    owners[transfer.to_address].tokenId.push(transfer.token_id);
                    owners[transfer.to_address].prices.push(transfer.prices);
                    owners[transfer.to_address].dates.push(transfer.dates);

                    /* Since the owner has been added as an object, we only update the
                     * owner's information like incrementing the NFTs they have, since with 
                     * this API call it means they own another NFT. I also added the
                     * price of this new NFT, the date it was bought and its id to 
                     * the arrays already filled with  dates, prices and token 
                     * ids of the owner's old NFTs. I also increment recent transactions
                     * which will update if the owner has had another recent transaction
                     * within 30 days.
                     */

                    owners[transfer.to_address].recentTx = owners[transfer.to_address].recentTx + recentTx;
                    /* The to_address's recent transactions being 
                     * incremented tells us the owner has been acquiring NFTs recently.
                     */ 

                    owners[transfer.to_address].avgHold = averageDaySinceBuy(owners[transfer.to_address].dates)
                    // I set average day for holding an NFT for this specific owner.

                    owners[transfer.to_address].avgPrice = averagePrice(owners[transfer.to_address].prices);
                    // calculates average of prices

                    accountedTokens.push(transfer.token_id);
                }

                if(owners[transfer.from_address] && recentTx === 1){
                    owners[transfer.from_address].recentTx = owners[transfer.from_address].recentTx - recentTx;
                    /* If the person sending the NFTs has an address established and
                     * recent transactions OF the block is set to 1, then you subtract
                     * this address's recent transactions because tjhey are selling their
                     * NFT. This can tell us if this address is offloading their NFTs
                     */
                } else if(!owners[transfer.from_address] && recentTx === 1) {
                    owners[transfer.from_address] = {
                        address: transfer.from_address,
                        amount: 0,
                        tokenId: [],
                        prices: [],
                        dates: [],
                        recentTx: -recentTx, // negative recent transactions bc they are selling NFT
                    };
                    /* If we do not have a from_address, we initialize it, 
                     * and set everything in it to nothing because owner has sold their 
                     * NFT and have nothing left. 
                     */
                }
                
                if(!history[transfer.to_address]) {
                    history[transfer.to_address] = [
                        {
                            to: transfer.to_address,
                            from: transfer.from_address,
                            price: transfer.value,
                            date: transfer.block_timestamp,
                            tokenId: transfer.token_Id,
                        },
                    ]
                } else {
                    history[transfer.to_address].push({
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.token_Id,
                    });
                }

                if(!history[transfer.from_address]) {
                    history[transfer.from_address] = [
                        {
                            to: transfer.to_address,
                            from: transfer.from_address,
                            price: transfer.value,
                            date: transfer.block_timestamp,
                            tokenId: transfer.token_Id,
                        },
                    ]
                } else {
                    history[transfer.from_address].push({
                        to: transfer.to_address,
                        from: transfer.from_address,
                        price: transfer.value,
                        date: transfer.block_timestamp,
                        tokenId: transfer.token_Id,
                    });
                }
            }
        // for loop, loops through the result of API call
        
    } while(cursor != "" && cursor != null);
    /* as long as the cursor is not equal to an empty string
     * nor null which only happens when we get to the very first
     * transfers of this NFT (when the collection just came out)
     * This means we have reached the end of our cursors.
     * Here we are looping through our API calls.
     */ 

    const jsonContentOwners = JSON.stringify(owners);
    // turns all our owner objects into strings so we can see it

    const jsonContentHistory = JSON.stringify(history);
    // turns all our history objects into strings so we can see it

    fs.writeFile("moonbirdsOwners.json", jsonContentOwners, "utf8", function (err) {
        if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
    /* We save a file with the name: moonbirdsOwners.json with the content being our
     * stringified owners. If we get an error, the error is logged in the console
     * and if we are successful, we get a console message for that as well
     */

    fs.writeFile("moonbirdsHistory.json", jsonContentHistory, "utf8", function (err) {
        if (err) {
            console.log("An error occurred while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
    /* We save a file with the name: moonbirdsHistory.json with the content being the history
     * of transactions in the collection. If we get an error, the error is logged in the console
     * and if we are successful, we get a console message for that as well
     */
}

getAllOwners();
// runs the function we just created above!