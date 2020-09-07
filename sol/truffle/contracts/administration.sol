// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import "../contracts/core.sol";

abstract contract AssociationAdministration {
    
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

    function getAdminActionType() public virtual view returns (AdminAction);
}

contract AssociationAdministrationMemberban is AssociationAdministration {
    AdminAction public adminAction = AdminAction.MEMBERBAN;
    constructor(address _assoCtr, address payable _proposedMember) {
        proposedMember = _proposedMember;
        assoCtr = AssociationOrg(_assoCtr);
        require(_proposedMember != assoCtr.owner(), "Owner cannot be banned, change owner first");
    }
    function getAdminActionType() public override view returns (AdminAction) {
        return adminAction;
    }
}

contract AssociationAdministrationOwnerchange is AssociationAdministration {
    AdminAction public adminAction = AdminAction.OWNERCHANGE;
    constructor(address _assoCtr, address payable _proposedMember) {
        proposedMember = _proposedMember;
        assoCtr = AssociationOrg(_assoCtr);
        require(_proposedMember != assoCtr.owner(), "New owner cannot be old owner");
    }
    function getAdminActionType() public override view returns (AdminAction) {
        return adminAction;
    }
}

contract AssociationAdministrationSelfdestruct is AssociationAdministration {
    AdminAction public adminAction = AdminAction.SELFDESTRUCT;
    constructor(address _assoCtr) {
        assoCtr = AssociationOrg(_assoCtr);
    }
    function getAdminActionType() public override view returns (AdminAction) {
        return adminAction;
    }
}