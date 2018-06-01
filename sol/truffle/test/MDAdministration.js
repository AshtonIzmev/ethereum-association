var MDOrg = artifacts.require("MDOrg");
var MDCoopt = artifacts.require("MDCoopt");
var MDAdminOC = artifacts.require("MDAdministrationOwnerchange");
var MDAdminMB = artifacts.require("MDAdministrationMemberban");
var MDAdminSD = artifacts.require("MDAdministrationSelfdestruct");

contract('MDAdministration', async(accounts) => {

  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let mdOrg3Members;
  let mdOrg2Members;
  let owner               = accounts[0];
  let randomGuy           = accounts[1];
  let wannabeMember       = accounts[5];
  let wannabeMemberToo    = accounts[6];


  before(async() => {
    mdOrg3Members = await MDOrg.new();
    // first cooptation
    let cooptCtr = await MDCoopt.new(mdOrg3Members.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await mdOrg3Members.cooptMember(cooptCtr.address, {from: owner});
    // second cooptation
    let cooptCtr2 = await MDCoopt.new(mdOrg3Members.address, {from: wannabeMemberToo});
    await cooptCtr2.cooptMember();
    await cooptCtr2.cooptMember({from: wannabeMember})
    await mdOrg3Members.cooptMember(cooptCtr2.address, {from: wannabeMemberToo});

    mdOrg2Members = await MDOrg.new();
    // first cooptation
    let cooptCtr3 = await MDCoopt.new(mdOrg2Members.address, {from: wannabeMember});
    await cooptCtr3.cooptMember();
    await mdOrg2Members.cooptMember(cooptCtr3.address, {from: owner});
  });

  it("should not allow a non-member to vote", async() => {
    let mdAdmin = await MDAdminOC.new(mdOrg3Members.address, randomGuy);
    await tryCatch(mdAdmin.vote({from: randomGuy}), errTypes.revert);
  });

  it("should allow a owner to vote", async() => {
    let mdAdmin = await MDAdminOC.new(mdOrg3Members.address, randomGuy);
    await mdAdmin.vote({from: owner});
  });

  it("Valid vote", async() => {
    let mdAdminOC = await MDAdminOC.new(mdOrg3Members.address, randomGuy);
    let voteCountBefore = await mdAdminOC.voteCount();
    await mdAdminOC.vote({from: wannabeMember});
    let voteCountAfter = await mdAdminOC.voteCount();
    let didVote = await mdAdminOC.didVotes(wannabeMember);
    let didNotVote = await mdAdminOC.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("unvote please", async() => {
    let mdAdminMB = await MDAdminMB.new(mdOrg3Members.address, randomGuy);
    let voteCountBefore = await mdAdminMB.voteCount();
    await mdAdminMB.vote({from: wannabeMember});
    await mdAdminMB.unvote({from: wannabeMember});
    let voteCountAfter = await mdAdminMB.voteCount();
    let didNotVote = await mdAdminMB.didVotes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 0, "One single vote after");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Duplicate vote", async() => {
    let mdAdminMB = await MDAdminMB.new(mdOrg3Members.address, randomGuy);
    let voteCountBefore = await mdAdminMB.voteCount();
    await mdAdminMB.vote({from: wannabeMember});
    let voteCountAfter = await mdAdminMB.voteCount();
    await mdAdminMB.vote({from: wannabeMember});
    let voteCountAfter2 = await mdAdminMB.voteCount();
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.equal(voteCountAfter2, 1, "One single vote after duplicate vote");
  });

  it("fake unvote please", async() => {
    let mdAdminSD = await MDAdminSD.new(mdOrg3Members.address, randomGuy);
    let voteCountBefore = await mdAdminSD.voteCount();
    await mdAdminSD.vote({from: wannabeMember});
    await mdAdminSD.unvote({from: wannabeMemberToo});
    let voteCountAfter = await mdAdminSD.voteCount();
    let didVote = await mdAdminSD.didVotes(wannabeMember);
    let didNotVote = await mdAdminSD.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("bad mdOrg reference", async() => {
    let mdOrg = await MDOrg.new();
    let mdOrgFake = await MDOrg.new();
    let mdAdminOC = await MDAdminOC.new(mdOrgFake.address, randomGuy);
    await mdAdminOC.vote();
    await tryCatch(mdOrg.handleOwnerchangeAction(mdAdminOC.address), errTypes.revert);  
  });

  it("Simple vote OWNERSHIP change", async() => {
    let mdAdminOC = await MDAdminOC.new(mdOrg2Members.address, wannabeMember);
    await mdAdminOC.vote();
    await mdAdminOC.vote({from:wannabeMember});
    let ownerBefore = await mdOrg2Members.owner();
    await mdOrg2Members.handleOwnerchangeAction(mdAdminOC.address);
    let ownerAfter = await mdOrg2Members.owner();
    let mdAdminOC2 = await MDAdminOC.new(mdOrg2Members.address, owner);
    await mdAdminOC2.vote();
    await mdAdminOC2.vote({from:wannabeMember});
    await mdOrg2Members.handleOwnerchangeAction(mdAdminOC2.address);
    let ownerAfter2 = await mdOrg2Members.owner();
    assert.equal(ownerBefore, owner, "Owneship Before");
    assert.equal(ownerAfter, wannabeMember, "Owneship changed :) Good luck");
    assert.equal(ownerAfter2, owner, "Owneship After again");
  });

  it("Simple vote OWNERSHIP change refused because maintenance mode", async() => {
    let mdAdminOC = await MDAdminOC.new(mdOrg2Members.address, wannabeMember);
    await mdAdminOC.vote();
    await mdAdminOC.vote({from:wannabeMember});
    await mdOrg2Members.switchMaintenanceMode({from:owner});
    await tryCatch(mdOrg2Members.handleOwnerchangeAction(mdAdminOC.address), errTypes.revert);
  });


});
