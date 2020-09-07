var AssoOrg = artifacts.require("AssociationOrg");
var AssoCoopt = artifacts.require("AssociationCoopt");
var AssoAdminOC = artifacts.require("AssociationAdministrationOwnerchange");
var AssoAdminMB = artifacts.require("AssociationAdministrationMemberban");
var AssoAdminSD = artifacts.require("AssociationAdministrationSelfdestruct");

contract('AssociationAdministration', async(accounts) => {

  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let assoOrg3Members;
  let assoOrg2Members;
  let owner               = accounts[0];
  let randomGuy           = accounts[1];
  let wannabeMember       = accounts[5];
  let wannabeMemberToo    = accounts[6];


  before(async() => {
    assoOrg3Members = await AssoOrg.new();
    // first cooptation
    let cooptCtr = await AssoCoopt.new(assoOrg3Members.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg3Members.cooptMember(cooptCtr.address, {from: owner});
    // second cooptation
    let cooptCtr2 = await AssoCoopt.new(assoOrg3Members.address, {from: wannabeMemberToo});
    await cooptCtr2.cooptMember();
    await cooptCtr2.cooptMember({from: wannabeMember})
    await assoOrg3Members.cooptMember(cooptCtr2.address, {from: wannabeMemberToo});

    assoOrg2Members = await AssoOrg.new();
    // first cooptation
    let cooptCtr3 = await AssoCoopt.new(assoOrg2Members.address, {from: wannabeMember});
    await cooptCtr3.cooptMember();
    await assoOrg2Members.cooptMember(cooptCtr3.address, {from: owner});
  });

  it("should not allow a non-member to vote", async() => {
    let admin = await AssoAdminOC.new(assoOrg3Members.address, randomGuy);
    await tryCatch(admin.vote({from: randomGuy}), errTypes.revert);
  });

  it("should allow a owner to vote", async() => {
    let admin = await AssoAdminOC.new(assoOrg3Members.address, randomGuy);
    await admin.vote({from: owner});
  });

  it("Valid vote", async() => {
    let adminOC = await AssoAdminOC.new(assoOrg3Members.address, randomGuy);
    let voteCountBefore = await adminOC.voteCount();
    await adminOC.vote({from: wannabeMember});
    let voteCountAfter = await adminOC.voteCount();
    let didVote = await adminOC.didVotes(wannabeMember);
    let didNotVote = await adminOC.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("unvote please", async() => {
    let adminMB = await AssoAdminMB.new(assoOrg3Members.address, randomGuy);
    let voteCountBefore = await adminMB.voteCount();
    await adminMB.vote({from: wannabeMember});
    await adminMB.unvote({from: wannabeMember});
    let voteCountAfter = await adminMB.voteCount();
    let didNotVote = await adminMB.didVotes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 0, "One single vote after");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Duplicate vote", async() => {
    let adminMB = await AssoAdminMB.new(assoOrg3Members.address, randomGuy);
    let voteCountBefore = await adminMB.voteCount();
    await adminMB.vote({from: wannabeMember});
    let voteCountAfter = await adminMB.voteCount();
    await adminMB.vote({from: wannabeMember});
    let voteCountAfter2 = await adminMB.voteCount();
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.equal(voteCountAfter2, 1, "One single vote after duplicate vote");
  });

  it("fake unvote please", async() => {
    let adminSD = await AssoAdminSD.new(assoOrg3Members.address);
    let voteCountBefore = await adminSD.voteCount();
    await adminSD.vote({from: wannabeMember});
    await adminSD.unvote({from: wannabeMemberToo});
    let voteCountAfter = await adminSD.voteCount();
    let didVote = await adminSD.didVotes(wannabeMember);
    let didNotVote = await adminSD.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("bad assoOrg reference", async() => {
    let assoOrg = await AssoOrg.new();
    let assoOrgFake = await AssoOrg.new();
    let assoAdminOC = await AssoAdminOC.new(assoOrgFake.address, randomGuy);
    await assoAdminOC.vote();
    await tryCatch(assoOrg.handleOwnerchangeAction(assoAdminOC.address), errTypes.revert);  
  });

  it("Simple vote OWNERSHIP change", async() => {
    let adminOC = await AssoAdminOC.new(assoOrg2Members.address, wannabeMember);
    await adminOC.vote();
    await adminOC.vote({from:wannabeMember});
    let ownerBefore = await assoOrg2Members.owner();
    await assoOrg2Members.handleOwnerchangeAction(adminOC.address);
    let ownerAfter = await assoOrg2Members.owner();
    let adminOC2 = await AssoAdminOC.new(assoOrg2Members.address, owner);
    await adminOC2.vote();
    await adminOC2.vote({from:wannabeMember});
    await assoOrg2Members.handleOwnerchangeAction(adminOC2.address);
    let ownerAfter2 = await assoOrg2Members.owner();
    assert.equal(ownerBefore, owner, "Owneship Before");
    assert.equal(ownerAfter, wannabeMember, "Owneship changed :) Good luck");
    assert.equal(ownerAfter2, owner, "Owneship After again");
  });

  it("Simple vote OWNERSHIP change refused because maintenance mode", async() => {
    let adminOC = await AssoAdminOC.new(assoOrg2Members.address, wannabeMember);
    await adminOC.vote();
    await adminOC.vote({from:wannabeMember});
    await assoOrg2Members.switchMaintenanceMode({from:owner});
    await tryCatch(assoOrg2Members.handleOwnerchangeAction(adminOC.address), errTypes.revert);
  });

  it("Self destruct", async() => {
    let assoOrg = await AssoOrg.new();
    let adminSD = await AssoAdminSD.new(assoOrg.address);
    await adminSD.vote();
    await assoOrg.handleSelfdestructAction(adminSD.address);
  });

  it("Member ban", async() => {
    let assoOrg2Mem = await AssoOrg.new();
    // first cooptation
    let cooptCtr3 = await AssoCoopt.new(assoOrg2Mem.address, {from: wannabeMember});
    await cooptCtr3.cooptMember();
    await assoOrg2Mem.cooptMember(cooptCtr3.address, {from: owner});
    
    let adminMB = await AssoAdminMB.new(assoOrg2Mem.address, wannabeMember);
    await adminMB.vote();
    let memberCountBefore = await assoOrg2Mem.membersCount();
    await assoOrg2Mem.handleMemberbanAction(adminMB.address);
    let memberCountAfter = await assoOrg2Mem.membersCount();

    assert.equal(memberCountBefore, 2, "2 members before");
    assert.equal(memberCountAfter, 1, "One member after");
  })

  it("Owner ban ??", async() => {
    let assoOrg = await AssoOrg.new();
    await tryCatch(AssoAdminMB.new(assoOrg.address, owner), errTypes.revert);
  })

  it("Owner owner change ??", async() => {
    let assoOrg = await AssoOrg.new();
    await tryCatch(AssoAdminOC.new(assoOrg.address, owner), errTypes.revert);
  })

});
