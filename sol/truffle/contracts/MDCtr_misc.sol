pragma solidity ^0.4.23;

import "../contracts/MDCtr_core.sol";

contract MDReferendum {
    
    MDOrg public mdCtr;

    string public referendumQuestion;
    mapping (address => int8) public votes;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    constructor(address _mdCtr, string _question) public {
        mdCtr = MDOrg(_mdCtr); 
        referendumQuestion = _question;
    }
    
    modifier onlyMDMembers() {
        require(
            mdCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }
    
    /// Vote  $(_vote) -1 for No, 0 for abstention, 1 for Yes
    /// Other votes will be considered invalids :)
    function vote(int8 _vote) public onlyMDMembers {
        require((_vote == 1) || (_vote == 0) || (_vote == -1), "Invalid vote");
        if (!didVotes[msg.sender]) {
            didVotes[msg.sender] = true;
            voteCount ++;
        }
        votes[msg.sender] = _vote;
    }

    function unvote() public onlyMDMembers {
        require(didVotes[msg.sender], "No vote found to unvote");
        didVotes[msg.sender] = false;
        voteCount --;
        votes[msg.sender] = 0;
    }
}

contract MDReward is MDReferendum {
    uint public reward;
    address public proposedMember;

    constructor(address _mdCtr, address _proposedMember, uint _reward) public {
        require(_reward < 90, "Reward cannot be greater than welcoming reward :)");
        mdCtr = MDOrg(_mdCtr);
        proposedMember = _proposedMember;
        reward = _reward;
    }
}

contract MDAdministration {
    
    enum AdminAction {MEMBERBAN, OWNERCHANGE, SELFDESTRUCT}
    
    MDOrg public mdCtr;

    address public proposedMember;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    modifier onlyMDMembers() {
        require(
            mdCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }

    /// Vote for the administration action
    function vote() public onlyMDMembers {
        if (!didVotes[msg.sender]) {
            didVotes[msg.sender] = true;
            voteCount ++;
        }
    }

    /// Unvote for the administration action
    function unvote() public onlyMDMembers {
        if (didVotes[msg.sender]) {
            didVotes[msg.sender] = false;
            voteCount --;
        }
    }

    function getAdminActionType() public view returns (AdminAction);
}

contract MDAdministrationMemberban is MDAdministration {
    AdminAction public adminAction = AdminAction.MEMBERBAN;
    constructor(address _mdCtr, address _proposedMember) public {
        proposedMember = _proposedMember;
        mdCtr = MDOrg(_mdCtr);
        require(_proposedMember != mdCtr.owner(), "Owner cannot be banned, change owner first");
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}

contract MDAdministrationOwnerchange is MDAdministration {
    AdminAction public adminAction = AdminAction.OWNERCHANGE;
    constructor(address _mdCtr, address _proposedMember) public {
        proposedMember = _proposedMember;
        mdCtr = MDOrg(_mdCtr);
        require(_proposedMember != mdCtr.owner(), "New owner cannot be old owner");
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}

contract MDAdministrationSelfdestruct is MDAdministration {
    AdminAction public adminAction = AdminAction.SELFDESTRUCT;
    constructor(address _mdCtr) public {
        mdCtr = MDOrg(_mdCtr);
    }
    function getAdminActionType() public view returns (AdminAction) {
        return adminAction;
    }
}