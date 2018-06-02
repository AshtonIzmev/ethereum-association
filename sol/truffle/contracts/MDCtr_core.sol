pragma solidity ^0.4.23;

import "../contracts/MDCtr_misc.sol";

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

    modifier maintenanceOff() {
        require(!maintenanceMode, "Maintenance mode activated");
        _;
    }

    /// In case of a smart contract problem, activate maintenance mode
    function switchMaintenanceMode() public onlyOwner {
        maintenanceMode = !maintenanceMode;
    }
    
    /// Propose $(_cooptedMember) to be a part of the organization
    function cooptMember(address _cooptCtr) public maintenanceOff {
        MDCoopt mdCooptCtr = MDCoopt(_cooptCtr);
        require(
            mdCooptCtr.mdCtr() == this, 
            "Invalid CooptationContract reference to MoroccanContract");
        require(
            mdCooptCtr.cooptationCount() > membersCount/2,
            "Insufficient number of member cooptations (need 51%)");
        require(
            !members[mdCooptCtr.cooptedMember()], 
            "Already a member");
        members[mdCooptCtr.cooptedMember()] = true;
        membersCount ++;
    }

    function handleMemberbanAction(address _adminCtr) public maintenanceOff {
        MDAdministrationMemberban mdAdminCtr = MDAdministrationMemberban(_adminCtr);
        require(mdAdminCtr.adminAction() == MDAdministration.AdminAction.MEMBERBAN, "Memberban action required");
        require(mdAdminCtr.mdCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(mdAdminCtr.voteCount() > membersCount/3, "Need at least 34% of the votes");
        require(membersCount > 1, "Can't ban if only a one member left");
        require(mdAdminCtr.proposedMember() != owner, "Member to ban cannot be the owner");
        require(members[mdAdminCtr.proposedMember()], "Member to ban is not a member");
        members[mdAdminCtr.proposedMember()] = false;
        membersCount --;
    }

    function handleOwnerchangeAction(address _adminCtr) public maintenanceOff {
        MDAdministrationOwnerchange mdAdminCtr = MDAdministrationOwnerchange(_adminCtr);
        require(mdAdminCtr.adminAction() == MDAdministration.AdminAction.OWNERCHANGE, "Ownerchange action required");
        require(mdAdminCtr.mdCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(mdAdminCtr.voteCount() > membersCount/2, "Need at least 51% of the votes");
        require(mdAdminCtr.proposedMember() != owner, "New owner cannot be the current owner");
        require(members[mdAdminCtr.proposedMember()], "New owner is not a member");
        owner = mdAdminCtr.proposedMember();
    }

    function handleSelfdestructAction(address _adminCtr) public maintenanceOff {
        MDAdministrationSelfdestruct mdAdminCtr = MDAdministrationSelfdestruct(_adminCtr);
        require(mdAdminCtr.adminAction() == MDAdministration.AdminAction.SELFDESTRUCT, "Selfdestruct action required");
        require(mdAdminCtr.mdCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(mdAdminCtr.voteCount() > (2*membersCount)/3, "Need at least 66% of the votes ");
        selfdestruct(owner);
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