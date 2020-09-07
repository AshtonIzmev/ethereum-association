// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "../contracts/core.sol";

contract AssociationReferendum {
    
    AssociationOrg public assoCtr;

    string public referendumQuestion;
    mapping (address => int8) public votes;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    constructor(address _assoCtr, string memory _question) {
        assoCtr = AssociationOrg(_assoCtr); 
        referendumQuestion = _question;
    }
    
    modifier onlyMembers() {
        require(
            assoCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }
    
    /// Vote  $(_vote) -1 for No, 0 for abstention, 1 for Yes
    /// Other votes will be considered invalids :)
    function vote(int8 _vote) public onlyMembers {
        require((_vote == 1) || (_vote == 0) || (_vote == -1), "Invalid vote");
        if (!didVotes[msg.sender]) {
            didVotes[msg.sender] = true;
            voteCount ++;
        }
        votes[msg.sender] = _vote;
    }

    function unvote() public onlyMembers {
        require(didVotes[msg.sender], "No vote found to unvote");
        didVotes[msg.sender] = false;
        voteCount --;
        votes[msg.sender] = 0;
    }
}

/**
contract AssociationReward is AssociationReferendum {
    uint public reward;
    address public proposedMember;

    constructor(address _assoCtr, address _proposedMember, uint _reward) {
        require(_reward < 90, "Reward cannot be greater than welcoming reward :)");
        assoCtr = AssociationOrg(_assoCtr);
        proposedMember = _proposedMember;
        reward = _reward;
    }
}
 */