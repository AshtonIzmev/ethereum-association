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
        if (!didVotes[msg.sender]) {
            didVotes[msg.sender] = true;
            voteCount ++;
        }
        votes[msg.sender] = _vote;
    }

    function unvote() public onlyMDMembers {
        if (didVotes[msg.sender]) {
            didVotes[msg.sender] = false;
            voteCount --;
            votes[msg.sender] = 0;
        }
    }
}

contract MDAdministration {
    
    enum AdminAction {MEMBERBAN, OWNERCHANGE, SELFDESTRUCT}
    
    MDOrg public mdCtr;

    AdminAction public adminAction;
    address public proposedMember;
    mapping (address => bool) public didVotes;
    uint public voteCount;
    
    constructor(address _mdCtr, address _proposedMember, uint _actionType) public {
        require(uint(AdminAction.SELFDESTRUCT) >= _actionType, "Invalid administration action type");
        proposedMember = _proposedMember;
        mdCtr = MDOrg(_mdCtr);
        adminAction = AdminAction(_actionType);
    }
    
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
}