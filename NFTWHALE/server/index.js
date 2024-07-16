const express = require("express");
const cors = require("cors");

const moonbirds = require("./moonbirdsOwners");
// contains object of owners

const moonbirdsH = require("./moonbirdsHistory");
// contains obecjt for all transactions related to moonbirds collection

const collections = {
  "0x23581767a106ae21c074b2276D25e5C3e136a68b": {
    owners: moonbirds,
    history: moonbirdsH
  },
}
/* We created a collections object so when we
 * have multiple collections, we can refer to the specific collection
 * we want. The key of this object is the contract address
 * of the collection. The key has the owners + history of 
 * that collection as variables.
 */

const app = express();
/* Crete our app using express
 *  express = a node js web application framework that provides broad 
 * features for building web and mobile applications. It is used to build 
 * a single page, multipage, and hybrid web application.
 */

const port = 4000;
/* using port 4000 to run our backend server!
 * UDP port 4000 uses the Datagram Protocol, a communications protocol for 
 * the Internet network layer, transport layer, and session layer. This protocol 
 * when used over PORT 4000 makes possible the transmission of a datagram message 
 * from one computer to an application running in another computer.
 */

app.use(cors());
/* Cross-origin resource sharing (CORS) is a mechanism that allows restricted 
 * resources on a web page to be requested from another domain outside the domain 
 * from which the first resource was served. A web page may freely embed cross-origin images, 
 * stylesheets, scripts, iframes, and videos
 */

app.get("/", (req, res) => {
    res.send("Welcome to the Whale NFT server");
});
// when opening up webpage on browser this message shows

/* In APIs, an endpoint is typically a uniform resource locator 
 * (URL) that provides the location of a resource on the server.
 */

app.get("/collection", (req, res) => {
  const slug = req.query.slug;
  res.send(collections[slug].owners);
});
/* The request parameter will pass in a slug which is the collection address.
 * Then the owners of that collection is returned. A collection endpoint is...
 */

/* The way to use this would be searching up:
 * "localhost:4000/collection?slug=[collection address]". We are then 
 * returned with the owners file.
 */

app.get("/user", (req, res) => {
  const slug = req.query.slug;
  const address = req.query.address;
  res.send(collections[slug].history[address]);
});
/* If you want to find out the trransactions of one address, the request 
 * parameter passes in a slug + address you want to look into.
 * The transactions of the specified address is returned. A user
 * endpoint is being used meaning "an endpoint used by a user to interact
 * with our dApp."
 */

/* The way to use this would be searching up:
 * "localhost:4000/collection?slug=[collection address]&address=[wallet address]". We are then 
 * returned with the transactions of that wallet.
 */

app.listen(port, () =>
  console.log(`Whale NFT server running on ${port}`)
);
/* tell us what port we are running on in terminal
 * The app. listen() function is used to bind and 
 * listen the connections on the specified host and port.
 */

