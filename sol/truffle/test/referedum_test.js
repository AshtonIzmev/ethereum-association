var AssoOrg = artifacts.require("AssociationOrg");
var AssoCoopt = artifacts.require("AssociationCoopt");
var AssoReferendum = artifacts.require("AssociationReferendum");

contract('AssociationReferendum', async(accounts) => {

  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let assoOrg3Members;
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
  });

  it("should not allow a non-member to vote", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    await tryCatch(assoRef.vote(-1, {from: randomGuy}), errTypes.revert);
  });

  it("Valid vote", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await assoRef.voteCount();
    await assoRef.vote(-1, {from: wannabeMember});
    let voteCountAfter = await assoRef.voteCount();
    let didVote = await assoRef.didVotes(wannabeMember);
    let didNotVote = await assoRef.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("unvote please", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await assoRef.voteCount();
    await assoRef.vote(-1, {from: wannabeMember});
    await assoRef.unvote({from: wannabeMember});
    let voteCountAfter = await assoRef.voteCount();
    let didNotVote = await assoRef.didVotes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 0, "One single vote after");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Duplicate vote", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await assoRef.voteCount();
    await assoRef.vote(-1, {from: wannabeMember});
    let voteBefore = await assoRef.votes(wannabeMember);
    let voteCountAfter = await assoRef.voteCount();
    await assoRef.vote(1, {from: wannabeMember});
    let voteCountAfter2 = await assoRef.voteCount();
    let voteAfter = await assoRef.votes(wannabeMember);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.equal(voteCountAfter2, 1, "One single vote after duplicate vote");
    assert.equal(voteBefore, -1, "Vote saved");
    assert.equal(voteAfter, 1, "Vote saved");
  });

  it("fake unvote please", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await assoRef.voteCount();
    await assoRef.vote(-1, {from: wannabeMember});
    await tryCatch(assoRef.unvote({from: wannabeMemberToo}), errTypes.revert);
    let voteCountAfter = await assoRef.voteCount();
    let didVote = await assoRef.didVotes(wannabeMember);
    let didNotVote = await assoRef.didVotes(wannabeMemberToo);
    assert.equal(voteCountBefore, 0, "No votes before");
    assert.equal(voteCountAfter, 1, "One single vote after");
    assert.isTrue(didVote, "He did vote");
    assert.isFalse(didNotVote, "He did not vote");
  });

  it("Invalid vote", async() => {
    let assoRef = await AssoReferendum.new(assoOrg3Members.address, "What is the answer ?");
    let voteCountBefore = await assoRef.voteCount();
    await tryCatch(assoRef.vote(2, {from: wannabeMember}), errTypes.revert);
  });

});
