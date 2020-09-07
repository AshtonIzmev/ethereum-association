// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "../contracts/referendum.sol";
import "../contracts/administration.sol";

contract AssociationOrg {
    
    mapping (address => bool) public members;
    mapping (address => uint) scores;
    mapping (address => uint) lastScoreUpdate;
    uint public membersCount;
    address payable public owner;
    bool public maintenanceMode;
    
    constructor() {
        owner = msg.sender;
        members[msg.sender] = true;
        scores[msg.sender] = 90;
        lastScoreUpdate[msg.sender] = block.number;
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
        AssociationCoopt assoCooptCtr = AssociationCoopt(_cooptCtr);
        require(
            assoCooptCtr.assoCtr() == this, 
            "Invalid CooptationContract reference to MoroccanContract");
        require(
            assoCooptCtr.cooptationCount() > membersCount/2,
            "Insufficient number of member cooptations (need 51%)");
        require(
            !members[assoCooptCtr.cooptedMember()], 
            "Already a member");
        members[assoCooptCtr.cooptedMember()] = true;
        scores[assoCooptCtr.cooptedMember()] = 90;
        lastScoreUpdate[assoCooptCtr.cooptedMember()] = block.number;
        membersCount ++;
    }

    function handleMemberbanAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationMemberban assoAdminCtr = AssociationAdministrationMemberban(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.MEMBERBAN, "Memberban action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() > membersCount/3, "Need at least 34% of the votes");
        require(membersCount > 1, "Can't ban if only a one member left");
        require(assoAdminCtr.proposedMember() != owner, "Member to ban cannot be the owner");
        require(members[assoAdminCtr.proposedMember()], "Member to ban is not a member");
        members[assoAdminCtr.proposedMember()] = false;
        membersCount --;
    }

    function handleOwnerchangeAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationOwnerchange assoAdminCtr = AssociationAdministrationOwnerchange(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.OWNERCHANGE, "Ownerchange action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() > membersCount/2, "Need at least 51% of the votes");
        require(assoAdminCtr.proposedMember() != owner, "New owner cannot be the current owner");
        require(members[assoAdminCtr.proposedMember()], "New owner is not a member");
        owner = assoAdminCtr.proposedMember();
    }

    function handleSelfdestructAction(address payable _adminCtr) public maintenanceOff {
        AssociationAdministrationSelfdestruct assoAdminCtr = AssociationAdministrationSelfdestruct(_adminCtr);
        require(assoAdminCtr.adminAction() == AssociationAdministration.AdminAction.SELFDESTRUCT, "Selfdestruct action required");
        require(assoAdminCtr.assoCtr() == this, "Invalid AdministrationContract reference to MoroccanContract");
        require(assoAdminCtr.voteCount() > (2*membersCount)/3, "Need at least 66% of the votes ");
        selfdestruct(owner);
    }

    /**
    function handleRewardAction(address _rewardCtr) public maintenanceOff {
        AssociationReward assoRewardCtr = AssociationReward(_rewardCtr);
        require(members[assoRewardCtr.proposedMember()], "Rewarded address must be a member");
        require(assoRewardCtr.assoCtr() == this, "Invalid RewardContract reference to MoroccanContract");
        require(assoRewardCtr.voteCount() > membersCount/10, "Need at least 10% of the votes ");
        scores[assoRewardCtr.proposedMember()] = getScore(assoRewardCtr.proposedMember()) + assoRewardCtr.reward();
        lastScoreUpdate[assoRewardCtr.proposedMember()] = block.number;
    }
     */
    
    /// Check if I am a member (same as calling members public variable)
    function amIMember() public view returns (bool) {
        return members[msg.sender];
    }

    /// Check if I am a member (same as calling members public variable)
    function getScore(address _address) public view returns (uint) {
        require(members[_address], "_add is not a member");
        // score is decreasing by 1 every day (given 15 secondes ethereum block)
        uint sc = scores[_address] - ((1 + block.number - lastScoreUpdate[_address])/5760);
        return sc;
    }
}

contract AssociationCoopt {
    
    AssociationOrg public assoCtr;

    address public cooptedMember;
    mapping (address => bool) public cooptations;
    uint public cooptationCount;
    
    constructor(address _assoCtr) {
        cooptedMember = msg.sender;
        assoCtr = AssociationOrg(_assoCtr); 
    }
    
    modifier onlyMembers() {
        require(
            assoCtr.members(msg.sender),
            "Only members are allowed to call this"
        );
        _;
    }
    
    /// Propose $(_cooptedMember) to be a part of the organization
    function cooptMember() public onlyMembers {
        if (!cooptations[msg.sender]) {
            cooptations[msg.sender] = true;
            cooptationCount ++;
        }
    }
}