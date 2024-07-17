const main = async () => {
// main async function is defined
    const [owner, randomPerson] = await hre.ethers.getSigners();
    /* Find the wallet address of the contract owner, and generate 
     * a random wallet address to be used later.
     */ 

    const songContractFactory = await hre.ethers.getContractFactory("SingPortal");
    /* Bytecode is human-written code converted to binary code so 
     * computers can understand. Initcode is the code written to
     * create the bytecode.To deploy a contract, you need the bytecode. The function
     * "getContractFactory" pulls the ABI(Application Binary Interface) and bytecode 
     * from the contract: WavePortal, and creates a contract factory object that is used
     * to deploy instances of smart contracts. The contractFactory object gets the bytecode
     * needed to run a smart contract. 
     */

    /* The application binary inteface An Application Binary Interface (ABI) is a set of rules
     * that define how a smart contract interacts with the outside world, specifically, with other
     * smart contracts and external applications. The ABI describes the interface of the smart 
     * contract, including the functions it exposes and the data types of the inputs and outputs
     * of those functions.
     * 
     * The ABI is used by the contract factory object to understand how to interact with the
     *  smart contract, so it knows which functions are available and how to encode and decode 
     * the input and output parameters of those functions.
     */

    // IN SHORT IT COMPILES OUR CODE AND GENERATES NEEDED FILES

    const singContract = await songContractFactory.deploy();
    /* When this method is called, it creates a new contract on the blockchain and 
     * returns a contract object that represents that contract. The contract object 
     * can be used to interact with the smart contract on the blockchain by calling its 
     * functions and reading its state. The "await" keyword is used to wait for the deploy() 
     * method to complete before assigning the result to the "waveContract" variable. 
     *
     * Once the deploy() method is completed, the "waveContract" variable will contain a 
     * contract object that represents the newly deployed smart contract instance on the 
     * Ethereum blockchain.
     */

    // IN SHORT NEW LOCAL ETH NETwORK IS CREATED EACH TIME WE RUN SCRIPT

    await singContract.deployed();
    /* This line of code is checking that the smart contract instance represented by the 
     * "waveContract" variable has been successfully deployed on the Ethereum blockchain. 
     * The "await" keyword is used to wait for the promise to resolve, meaning that the code 
     * execution will be paused until the contract is fully deployed and ready for use, this 
     * is useful for the developer to make sure the contract is deployed before interacting with it.
     */ 

    console.log("Contract deployed to:", singContract.address);
    // logs that the contract as been successfully deployed and prints the location/identifier
    // of the contract.

    console.log("Contract deployed by:", owner.address);

    await singContract.getTotalLyrics();
    // calls function in contract to print total waves before waving

    const firstLyricTxn = await singContract.sing();
    // In this case the OWNER calls the contract function to wave. 
    // firstWaveTxn = transaction of calling the Wave function

    await firstLyricTxn.wait();
    /* The await firstWaveTxn.wait(); line is waiting for the transaction waveTxn 
     * to be mined and included in a block on the Ethereum blockchain. Once the 
     * transaction is mined, it means that the sing() function has been executed successfully 
     * on the Ethereum network.
     */
  
    await singContract.getTotalLyrics();
  
    const secondLyricTxn = await singContract.connect(randomPerson).sing();
    /* The connect() function is a method provided by the library (ethers.js) 
     * used in this code and it is used to create a new contract instance that 
     * is connected to a different signer -> the randomPerson.
     */ 
    
    await secondLyricTxn.wait();

    await singContract.getTotalLyrics();
    /* The await lyricTxn.wait(); line is waiting for the transaction lyricTxn to be mined 
     * and included in a block on the Ethereum blockchain. Once the transaction is mined, 
     * it means that the wave() function has been executed successfully on the Ethereum network.
     */
};
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0); // exit Node process without error
      /* The "process" object in Node.js is a global object that provides information
       * about the current Node.js process, and it allows interaction with the process 
       * such as controlling the process's environment. The "exit()" method is used to 
       * end the Node.js process immediately with an exit code, which is an integer value that 
       * indicates the status of the process exit.
       */

      /* The argument "0" passed to the "exit()" method is the exit code. In this case, a 
       * value of "0" means that the process has completed successfully, and any other value 
       * represents an error.
       */

    } catch (error) {
      console.log(error);
      process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error

      /* The argument "1" passed to the "exit()" method is the exit code. In this case, 
       * a value of "1" means that the process has completed unsuccessfully. The exit code
       * is used by the operating system to indicate the status of the process exit, and 
       * it can be used for debugging or for scripting purposes.
       */
    }
    // Read more about Node exit ('process.exit(num)') status codes here: https://stackoverflow.com/a/47163396/7974948
  };
  
  runMain();