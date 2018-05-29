var MDOrg = artifacts.require("MDOrg");
var MDCoopt = artifacts.require("MDCoopt");
var MDAdmin = artifacts.require("MDAdministration");

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
    let mdAdmin = await MDAdmin.new(mdOrg3Members.address, randomGuy, 1);
    await tryCatch(mdAdmin.vote({from: randomGuy}), errTypes.revert);
  });

  it("Valid vote", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg3Members.address, randomGuy, 1);
    let voteCountBefore = await mdAdmin.voteCount();
    await mdAdmin.vote({from: wannabeMember});
    let voteCountAfter = await mdAdmin.voteCount();
    let didVote = await mdAdmin.didVotes(wannabeMember);
    let didNotVote = await mdAdmin.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("unvote please", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg3Members.address, randomGuy, 0);
    let voteCountBefore = await mdAdmin.voteCount();
    await mdAdmin.vote({from: wannabeMember});
    await mdAdmin.unvote({from: wannabeMember});
    let voteCountAfter = await mdAdmin.voteCount();
    let didNotVote = await mdAdmin.didVotes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 0, "One single vote after");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Duplicate vote", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg3Members.address, randomGuy, 1);
    let voteCountBefore = await mdAdmin.voteCount();
    await mdAdmin.vote({from: wannabeMember});
    let voteCountAfter = await mdAdmin.voteCount();
    await mdAdmin.vote({from: wannabeMember});
    let voteCountAfter2 = await mdAdmin.voteCount();
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.equal(voteCountAfter2, 1, "One single vote after duplicate vote");
  });

  it("fake unvote please", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg3Members.address, randomGuy, 2);
    let voteCountBefore = await mdAdmin.voteCount();
    await mdAdmin.vote({from: wannabeMember});
    await mdAdmin.unvote({from: wannabeMemberToo});
    let voteCountAfter = await mdAdmin.voteCount();
    let didVote = await mdAdmin.didVotes(wannabeMember);
    let didNotVote = await mdAdmin.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("bad mdOrg reference", async() => {
    let mdOrg = await MDOrg.new();
    let mdOrgFake = await MDOrg.new();
    let mdAdmin = await MDAdmin.new(mdOrgFake.address, randomGuy, 0);
    await mdAdmin.vote();
    await tryCatch(mdOrg.handleAdminAction(mdAdmin.address), errTypes.revert);  
  });

  it("Simple vote OWNERSHIP change", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg2Members.address, wannabeMember, 1);
    await mdAdmin.vote();
    await mdAdmin.vote({from:wannabeMember});
    let ownerBefore = await mdOrg2Members.owner();
    await mdOrg2Members.handleAdminAction(mdAdmin.address);
    let ownerAfter = await mdOrg2Members.owner();
    assert.equal(ownerBefore, owner, "Owneship Before");
    assert.equal(ownerAfter, wannabeMember, "Owneship changed :) Good luck");
  });

  it("Simple vote OWNERSHIP change refused because maintenance mode", async() => {
    let mdAdmin = await MDAdmin.new(mdOrg2Members.address, wannabeMember, 1);
    await mdAdmin.vote();
    await mdAdmin.vote({from:wannabeMember});
    await mdOrg.switchMaintenanceMode();
    await tryCatch(mdOrg2Members.handleAdminAction(mdAdmin.address), errTypes.revert);
  });


});
