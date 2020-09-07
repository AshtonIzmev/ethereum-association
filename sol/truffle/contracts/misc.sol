// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16;

import "../contracts/core.sol";

contract AssociationReferendum {
    
    AssociationOrg public assoCtr;

    string public referendumQuestion;
    mapping (address => int8) public votes;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    constructor(address _assoCtr, string memory _question) public {
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

contract AssociationReward is AssociationReferendum {
    uint public reward;
    address public proposedMember;

    constructor(address _assoCtr, address _proposedMember, uint _reward) public {
        require(_reward < 90, "Reward cannot be greater than welcoming reward :)");
        assoCtr = AssociationOrg(_assoCtr);
        proposedMember = _proposedMember;
        reward = _reward;
    }
}

contract AssociationAdministration {
    
    enum AdminAction {MEMBERBAN, OWNERCHANGE, SELFDESTRUCT}
    
    AssociationOrg public assoCtr;

    address payable public proposedMember;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    modifier onlyMembers() {
        require(
            assoCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }

    /// Vote for the administration action
    function vote() public onlyMembers {
        if (!didVotes[msg.sender]) {
            didVotes[msg.sender] = true;
            voteCount ++;
        }
    }

    /// Unvote for the administration action
    function unvote() public onlyMembers {
        if (didVotes[msg.sender]) {
            didVotes[msg.sender] = false;
            voteCount --;
        }
    }

    function getAdminActionType() public view returns (AdminAction);
}

contract AssociationAdministrationMemberban is AssociationAdministration {
    AdminAction public adminAction = AdminAction.MEMBERBAN;
    constructor(address _assoCtr, address payable _proposedMember) public {
        proposedMember = _proposedMember;
        assoCtr = AssociationOrg(_assoCtr);
        require(_proposedMember != assoCtr.owner(), "Owner cannot be banned, change owner first");
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}

contract AssociationAdministrationOwnerchange is AssociationAdministration {
    AdminAction public adminAction = AdminAction.OWNERCHANGE;
    constructor(address _assoCtr, address payable _proposedMember) public {
        proposedMember = _proposedMember;
        assoCtr = AssociationOrg(_assoCtr);
        require(_proposedMember != assoCtr.owner(), "New owner cannot be old owner");
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}

contract AssociationAdministrationSelfdestruct is AssociationAdministration {
    AdminAction public adminAction = AdminAction.SELFDESTRUCT;
    constructor(address _assoCtr) public {
        assoCtr = AssociationOrg(_assoCtr);
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}