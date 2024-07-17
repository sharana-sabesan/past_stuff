// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "hardhat/console.sol";
// you need this library to use console.log and print messages in the console.
// this will help when we need to debug

contract SingPortal {
    uint256 totalLyrics;
    /* The way that smart contracts work is that people can
     * use the functions of our contract like "waving" 
     */ 

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function sing() public {
        totalLyrics += 1;
         /* totalLyrics is a state variable meaning that is stored on the blockchain, 
         * and can be accessed and modified by smart contract functions. It's value is 
         * kept even after the contract execution ends. It is stored in the contract's storage, 
         * which is a part of the blockchain's state.
         */ 

        console.log("%s has sung a lyric!", msg.sender);
        /* There is a placeholder represented by %s, this placeholder will be replaced 
         * by the value of the variable that's passed after the comma, in this case is 
         * msg.sender`.
        */ 

        // %s is a placeholder for strings
    }

    function getTotalLyrics() public view returns (uint256) {
        /* a function can be defined as "public" which means that the function can be 
         * called and executed by anyone, including external contracts and external accounts.
         */

        /* a function can be defined as "view" which means that the function can only read 
         * the state of the contract but cannot make any modifications to it. It's a read-only 
         * function that doesn't change the contract's state, it only returns data. It also
         * does not cost ETH to call it. 
         */

        console.log("We have %d total lyrics!", totalLyrics);
        // %d is a placeholder for a decimal integer
        return totalLyrics;
    }
}