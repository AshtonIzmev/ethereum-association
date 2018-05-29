pragma solidity ^0.4.23;

contract MDOrg {
    
    mapping (address => bool) public members;
    uint public membersCount;
    address public owner;
    bool public maintenanceMode;
    
    constructor() public {
        owner = msg.sender;
        members[msg.sender] = true;
        membersCount = 1;
    }
    
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner is allowed to call this"
        );
        _;
    }
    
    modifier onlymembers() {
        require(
            members[msg.sender],
            "Only members are allowed to call this"
        );
        _;
    }

    /// In case of a smart contract problem, activate maintenance mode
    function switchMaintenanceMode() public onlyOwner {
        maintenanceMode = !maintenanceMode;
    }
    
    /// Propose $(_cooptedMember) to be a part of the organization
    function cooptMember(address _cooptCtr) public {
        require(!maintenanceMode, "Maintenance mode activated");
        MDCoopt mdCooptCtr = MDCoopt(_cooptCtr);
        require(
            mdCooptCtr.mdCtr() == this, 
            "Invalid CooptationContract reference to MoroccanContract");
        require(
            mdCooptCtr.cooptationCount() > membersCount/2,
            "Insufficient number of member cooptations");
        require(
            !members[mdCooptCtr.cooptedMember()], 
            "Already a member");
        members[mdCooptCtr.cooptedMember()] = true;
        membersCount ++;
    }

    function handleAdminAction(address _adminCtr) public {
        require(!maintenanceMode, "Maintenance mode activated");
        MDAdministration mdAdminCtr = MDAdministration(_adminCtr);
        require(
            mdAdminCtr.mdCtr() == this, 
            "Invalid AdministrationContract reference to MoroccanContract");
        require(
            mdAdminCtr.voteCount() > (2*membersCount)/3, 
            "Need at least 66% of the votes to operate an administration operation");
        if (mdAdminCtr.adminAction() == MDAdministration.AdminAction.MEMBERBAN) {
            require(
                membersCount > 1, 
                "Can't ban if only a one member");
            require(
                members[mdAdminCtr.proposedMember()], 
                "Proposed ban is not a member");
            members[mdAdminCtr.proposedMember()] = false;
            membersCount --;
        } else if (mdAdminCtr.adminAction() == MDAdministration.AdminAction.OWNERCHANGE) {
            require(
                members[mdAdminCtr.proposedMember()], 
                "Proposed ban is not a member");
            owner = mdAdminCtr.proposedMember();
        } else if (mdAdminCtr.adminAction() == MDAdministration.AdminAction.SELFDESTRUCT) {
            selfdestruct(owner);
        }
    }
    
    /// Check if I am a member (same as calling members public variable)
    function amIMember() public view returns (bool) {
        return members[msg.sender];
    }
}

contract MDCoopt {
    
    MDOrg public mdCtr;

    address public cooptedMember;
    mapping (address => bool) public cooptations;
    uint public cooptationCount;
    
    constructor(address _mdCtr) public {
        cooptedMember = msg.sender;
        mdCtr = MDOrg(_mdCtr); 
    }
    
    modifier onlyMDMembers() {
        require(
            mdCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }
    
    /// Propose $(_cooptedMember) to be a part of the organization
    function cooptMember() public onlyMDMembers {
        if (!cooptations[msg.sender]) {
            cooptations[msg.sender] = true;
            cooptationCount ++;
        }
    }
}

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