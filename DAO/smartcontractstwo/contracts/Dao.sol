// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IdaoContract {
    function balanceOf(address, uint256) external view returns (uint256);
}
/* To make sure that any address actually owns any of these valid tokens, 
 * we need to make an interface to the smart contract that created this NFT tokens 
 * which keeps track of the balance of any addresses that hold these tokens.
 * We use this function from OpenSea's storefront which allows us to 
 * check how many of a token an address owns. The function returns the balance. 
 */
contract Dao {
    address public owner;
    // anyone in the blockchain space can view who the owner of the DAO is

    uint256 nextProposal;
    // this is the ID of every proposal the DAO community puts out

    uint256[] public validTokens;
    // an array that distinguishes which tokens are allowed to vote in the DAO
    // We will have token ID numbers that allow users to vote and make proposals

    IdaoContract daoContract; 
    // we create a reference to our interface to be able to use the balanceOf function

    constructor() {
        owner = msg.sender;
        // whoever deployed the contract becomes the owner

        nextProposal = 1;
        // the first proposal that is created will have an ID of 1
        // everytime we create a new proposal this variable is incremented

        daoContract = IdaoContract(0x2953399124F0cBB46d2CbACD8A89cF0599974963);
        /* we take the IdaoContract interface and make sure we use the smart 
         * contract for Opensea's storefront on the Polygon Mumbai testnet. 
         * Anytime we call this contract, we can use the balanceOf function. 
         */

        validTokens = [77911218958299967590272502262611450917098095967099485775801823480259259924495];
        /* This adds the NFT token ID you need to vote to the validTokens array. We can
         * use it to check if the person casting a vote actuallys hold the correct NFT from the
         * Idao Contract.
         */
    }

    struct proposal {
    /* a struct is an object that defines different variables
     * We are using it to define the structure of our proposal 
     */

        uint256 id; //nextProposal variable is stored here
        bool exists; //whether this proposal exists if someone searches it up
        string descriptions;
        uint deadline;
        uint256 votesUp;
        uint256 votesDown;
        address[] canVote; // the array of addresses that can vote
        uint256 maxVotes; // length of canVote array
        mapping(address => bool) voteStatus; 
        /* gives us voting status of every address, t or f
         * If you're in the the canVote array, but you have already voted. 
         * Your voting status is set to false, so you can't vote multiple times. 
         */

        bool countConducted; // if time limit has passed
        bool passed; // if the proposal should be passed or not based on votes up
    }

    mapping(uint256 => proposal) public Proposals;
    /* maps proposal id to proposal
     * Anytime a proposal is created, we will want to fill in
     * all the variables for that proposal struct. It will stored
     * in the mapping for anyone to view publicly. 
     */

    event proposalCreated (
        uint256 id,
        string description,
        uint256 maxVotes,
        address proposer
    );
    // since anyone can propose, we want to keep track of 
    // who is proposing with the proposer's address
    
    event newVote (
        uint256 votesUp,
        uint256 votesDown,
        address voter,
        uint256 proposal,
        bool votedFor
    );
    /* Gives us current # of votes down and up, 
     * the address of who made the most recent vote, 
     * on what proposal they made the vote on, and finally
     * did they vote for or against the proposal?
     */

     event proposalCount (
        uint256 id,
        bool passed
     );
     // when the owner calcualtes the outcome of the prosal, 
     // the user gets to see data on the proposal and if it was passed or not

    /* When new proposals are created or new votes are cast, 
     * these events are automatically synced to the Moralis database,
     * then we can present that data directly to our users through the Moralis dApp. 
     */


     function checkProposalEligibility(address _proposalist) private view returns (
        bool
     ){
        for(uint i = 0; i < validTokens.length; i++) {
            if (daoContract.balanceOf(_proposalist, validTokens[i]) >= 1){
                return true;
            }
        }
        return false;
     }
     /* If someone is trying to create a proposal, we will use 
      * this function: checkProposalEligibility as a required statement
      * for the function which will create proposals. This checks if
      * the proposer owns any NFTs/tokens to make them apart of
      * FlameDAO and allows them to make proposals. This function
      * takes in the address of the proposal proposer, and returns
      * a boolean confirming the proposer's eligibility!
      */

      /* The checkProposalEligibility function runs through all the
       * valid tokens and checks if the proposer owns 1 or more of 
       * any of the valid tokens, giving them the right to propose.
       * We use the balanceOf function from our DAO contract in 
       * the OpenSea testnet storefront
       */ 

       function checkVoteEligibility(uint256 _id, address _voter) private view returns (
        bool
       ){
            for(uint256 i = 0; i < Proposals[_id].canVote.length; i++) {
                if (Proposals[_id].canVote[i] == _voter) {
                    return true;
                }
            }
            return false;
       }
       /* The above function is also used as a required statement. It takes in
        * the proposal id, and the address of the voter attempting to vote for that
        * proposal. It then finds information about the specific proposal using 
        * the Proposals mapping, and specifically looks at the canVote array of addresses
        * who can vote on that proposal. The forloop then runs through the canVote
        * array for that proposal, to check of the potential voter's address is in that
        * array. A true or false value is returned based on this outcome.
        */ 

        /* If you noticed, we made both eligibility functions above private, 
         * so they are only applicable for this smart contract. They are the required 
         * functions we must execute before running public functions including: the vote
         * and createProposal function. We do not want anyone execept the owner of the 
         * contract to access the eligibility functions. ???
         */ 

        

        function createProposal(string memory _description, address[] memory _canVote) public {
            require(checkProposalEligibility(msg.sender), "Only NFT holders can put forth Proposals");
            /* this statement checks the eligibility of the person who called the
             * createProposal function, and requires the eligibility function to return true for
             * the msg.sender to be able to create a proposal! If we get false, an error message is
             * shown. 
             */

            proposal storage newProposal = Proposals[nextProposal];
            newProposal.id = nextProposal; 
            newProposal.exists = true;
            newProposal.descriptions = _description;
            newProposal.deadline = block.number + 100; // proposal must be completed before the next 100 blocks are added to chain
            newProposal.canVote = _canVote;
            newProposal.maxVotes = _canVote.length;

            /* Note: Much like RAM, Memory in Solidity is a temporary place to store data whereas Storage 
             * holds data between function calls. The Solidity Smart Contract can use any amount of 
             * memory during the execution but once the execution stops, the Memory is completely 
             * wiped off for the next execution.
             */ 

             // This is a public function, meaning any user can call it!

             emit proposalCreated(nextProposal, _description, _canVote.length, msg.sender);
             // calls/releases our event which occurs when a proposal is created and shows data for our user

             nextProposal++;
             // we increment so we don't have proposals with the same id when another proposal is created
        }

        function voteOnProposal(uint256 _id, bool _vote) public {
            require(Proposals[_id].exists, "This  Proposal does not exist");
            // checks if proposal even exists

            require(checkVoteEligibility(_id, msg.sender), "You can not vote on this Proposal");
            // checks if voter's address is in the canVote array aka the voting guest list

            require(!Proposals[_id].voteStatus[msg.sender], "You already voted on this Proposal");
            // checks if the voter has already voted for the proposal. 
            // Remember msg.sender is the address of the person who called this function

            require(block.number <= Proposals[_id].deadline, "The deadline has passed for this Proposal");
            // checks if deadline has passed or not

            proposal storage p = Proposals[_id];
            // create an instance of the Proposal object to access it's variables
            // set the instance equal to the proposal the voter wants to vote on

            if(_vote) {
                p.votesUp++;
            }else{
                p.votesDown++;
            }
            // if the boolean parameter _vote is true, this means the user is for the proposal
            // if it is false, the user is against the proposal

            p.voteStatus[msg.sender] = true;
            // the voteStatus array is updated to show that the voter has voted, so they can't vote twice

            emit newVote(p.votesUp, p.votesDown, msg.sender, _id, _vote);
            // calls/releases our event which occurs when a new vote is cast and shows data for our user
        }

        function countVotes(uint256 _id) public {
            require(msg.sender == owner, "Only Owner can count votes.");
            // makes sure only owner is counting votes

            require(Proposals[_id].exists,"This Proposal does not exist.");
            require(block.number > Proposals[_id].deadline, "Voting has not concluded");
            //makes sure deadline has passed

            require(!Proposals[_id].countConducted, "Count already conducted");
            // checks to see that the count has not been conducted yet

            proposal storage p = Proposals[_id];
            if(Proposals[_id].votesUp > Proposals[_id].votesDown) {
                p.passed = true;
            }
            // if the votes for the proposals outnumber the votes against it, the proposal is passed

            p.countConducted = true;
            // we set the countConducted bool to true so a count is conducted again

            emit proposalCount(_id, p.passed);
            // calls/releases our event which occurs when the count is conducted and shows data for our user
        }

        function addTokenId(uint256 _tokenId) public {
            require(msg.sender == owner, "Only Owner can add tokens");
            // only owner can add tokens and give voting rights 

            validTokens.push(_tokenId);
            // adds new token to validToken array
        }
        // In the function above, the owner can add a valid token which can be used by DAO
        // members(if they own any of the valid tokens) to participate in the DAO.
}