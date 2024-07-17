const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    /* using the getSigners() method provided by the hre.ethers library to
     * retrieve a list of Ethereum accounts that can be used to sign transactions. 
     * The first signer in the array is assigned to the deployer constant.
     */

    const accountBalance = await deployer.getBalance();
    /* using the getBalance() method on the deployer instance to retrieve 
     * the balance of the Ethereum account represented by the deployer constant. 
    */
  
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());
  
    const singContractFactory = await hre.ethers.getContractFactory("SingPortal");
    const singContract = await singContractFactory.deploy();
    await singContract.deployed();
  
    console.log("SingPortal address: ", singContract.address);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };

  runMain();