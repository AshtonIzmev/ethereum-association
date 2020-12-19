// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "../contracts/administration.sol";

contract AssociationOrg {

    struct MemberStruct {
        address addr;
        string name;
    }
    MemberStruct[] public membersHistoric;
    mapping (address => bool) public members;
    uint public membersCount;

    mapping (address => bool) public seenAdmins;
    address payable public owner;
    bool public maintenanceMode;
    string public name;
    string[] public referendums;
    
    
    constructor(string memory _name, string memory _memberName) {
        owner = msg.sender;
        members[msg.sender] = true;
        name = _name;
        membersCount = 1;
        MemberStruct memory newMember;
        newMember.addr = msg.sender;
        newMember.name = _memberName;
        membersHistoric.push(newMember);
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

    function handleCooptationAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationCooptation assoAdminCtr = AssociationAdministrationCooptation(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.COOPTATION, "Cooptation action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() * 2 >= membersCount, "Need at least 50% of the votes");
        require(!members[assoAdminCtr.proposedMember()], "Already a member");
        require(!seenAdmins[_adminCtr], "Already acted administration proposal");
        members[assoAdminCtr.proposedMember()] = true;

        MemberStruct memory newMember;
        newMember.addr = assoAdminCtr.proposedMember();
        newMember.name = assoAdminCtr.memberName();
        membersHistoric.push(newMember);

        membersCount ++;
        seenAdmins[_adminCtr] = true;
    }

    function handleMemberbanAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationMemberban assoAdminCtr = AssociationAdministrationMemberban(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.MEMBERBAN, "Memberban action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() * 2 > membersCount, "Need at least 51% of the votes");
        require(membersCount > 1, "Can't ban if only a one member left");
        require(assoAdminCtr.proposedMember() != owner, "Member to ban cannot be the owner");
        require(members[assoAdminCtr.proposedMember()], "Member to ban is not a member");
        require(!seenAdmins[_adminCtr], "Already acted administration proposal");
        members[assoAdminCtr.proposedMember()] = false;
        membersCount --;
        seenAdmins[_adminCtr] = true;
    }

    function handleOwnerchangeAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationOwnerchange assoAdminCtr = AssociationAdministrationOwnerchange(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.OWNERCHANGE, "Ownerchange action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() * 2 > membersCount, "Need at least 51% of the votes");
        require(assoAdminCtr.proposedMember() != owner, "New owner cannot be the current owner");
        require(members[assoAdminCtr.proposedMember()], "New owner is not a member");
        require(!seenAdmins[_adminCtr], "Already acted administration proposal");
        owner = assoAdminCtr.proposedMember();
        seenAdmins[_adminCtr] = true;
    }

    function handleSelfdestructAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationSelfdestruct assoAdminCtr = AssociationAdministrationSelfdestruct(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.SELFDESTRUCT, "Selfdestruct action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() * 3 > 2 * membersCount, "Need at least 66% of the votes ");
        require(!seenAdmins[_adminCtr], "Already acted administration proposal");
        selfdestruct(owner);
        seenAdmins[_adminCtr] = true;
    }

    function handleReferendumAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationReferendum assoAdminCtr = AssociationAdministrationReferendum(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.REFERENDUM, "Referendum action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() > membersCount/2, "Need at least 51% of the votes");
        require(!seenAdmins[_adminCtr], "Already acted administration proposal");
        referendums.push(assoAdminCtr.referendumQuestion());
        seenAdmins[_adminCtr] = true;
    }
    
    /// Check if I am a member (same as calling members public variable)
    function amIMember() public view returns (bool) {
        return members[msg.sender];
    }

    function getMemberHistoricCount() public view returns(uint count) {
        return membersHistoric.length;
    }

    function getReferendumsCount() public view returns(uint) {
        return referendums.length;
    }
    
}