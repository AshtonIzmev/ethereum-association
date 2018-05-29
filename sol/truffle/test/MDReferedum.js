var MDOrg = artifacts.require("MDOrg");
var MDCoopt = artifacts.require("MDCoopt");
var MDReferendum = artifacts.require("MDReferendum");

contract('MDReferendum', async(accounts) => {

  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let mdOrg3Members;
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
  });

  it("should not allow a non-member to vote", async() => {
    let mdRef = await MDReferendum.new(mdOrg3Members.address, "What is the answer ?");
    await tryCatch(mdRef.vote(-1, {from: randomGuy}), errTypes.revert);
  });

  it("Valid vote", async() => {
    let mdRef = await MDReferendum.new(mdOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await mdRef.voteCount();
    await mdRef.vote(-1, {from: wannabeMember});
    let voteCountAfter = await mdRef.voteCount();
    let didVote = await mdRef.didVotes(wannabeMember);
    let didNotVote = await mdRef.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("unvote please", async() => {
    let mdRef = await MDReferendum.new(mdOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await mdRef.voteCount();
    await mdRef.vote(-1, {from: wannabeMember});
    await mdRef.unvote({from: wannabeMember});
    let voteCountAfter = await mdRef.voteCount();
    let didNotVote = await mdRef.didVotes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 0, "One single vote after");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Duplicate vote", async() => {
    let mdRef = await MDReferendum.new(mdOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await mdRef.voteCount();
    await mdRef.vote(-1, {from: wannabeMember});
    let voteBefore = await mdRef.votes(wannabeMember);
    let voteCountAfter = await mdRef.voteCount();
    await mdRef.vote(1, {from: wannabeMember});
    let voteCountAfter2 = await mdRef.voteCount();
    let voteAfter = await mdRef.votes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.equal(voteCountAfter2, 1, "One single vote after duplicate vote");
    assert.equal(voteBefore, -1, "Vote saved");
    assert.equal(voteAfter, 1, "Vote saved");
  });

  it("fake unvote please", async() => {
    let mdRef = await MDReferendum.new(mdOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await mdRef.voteCount();
    await mdRef.vote(-1, {from: wannabeMember});
    await mdRef.unvote({from: wannabeMemberToo});
    let voteCountAfter = await mdRef.voteCount();
    let didVote = await mdRef.didVotes(wannabeMember);
    let didNotVote = await mdRef.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

});
