var AssoOrg = artifacts.require("AssociationOrg");
var AssoCoopt = artifacts.require("AssociationCoopt");

contract('AssociationCoopt', async(accounts) => {

  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let owner         = accounts[0];
  let randomGuy      = accounts[1];
  let wannabeMember = accounts[5];
  let wannabeMemberToo = accounts[6];
  let wannabeMemberTooToo = accounts[7];

  it("Cooptation of the creator is ok", async() => {
    let assoOrg = await AssoOrg.new({from: owner});
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    let cooptedMem = await cooptCtr.cooptedMember();
    await cooptCtr.cooptMember({from: owner});

    let numCoopt = await cooptCtr.cooptationCount();
    let cooptPresent = await cooptCtr.cooptations(owner);
    assert.equal(cooptedMem, wannabeMember, "Correct coopted member");
    assert.equal(numCoopt.toNumber(), 1, "Correct number of cooptations");
    assert.isTrue(cooptPresent, "Cooptation is present");

    await cooptCtr.cooptMember({from: owner});
    let numCoopt2 = await cooptCtr.cooptationCount();
    assert.equal(numCoopt2.toNumber(), 1, "Still correct number of cooptations");    
  });

  it("Accepted cooptation", async() => {
    let assoOrg = await AssoOrg.new();
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg.cooptMember(cooptCtr.address, {from: owner});
    let isMem = await assoOrg.members(wannabeMember);
    let isNotMem = await assoOrg.members(randomGuy);
    assert.isTrue(isMem, "Cooptation has been accepted");
    assert.isFalse(isNotMem, "Unknown member");
  });

  it("Refused cooptation in maintenance mode", async() => {
    let assoOrg = await AssoOrg.new();
    await assoOrg.switchMaintenanceMode();
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await tryCatch(assoOrg.cooptMember(cooptCtr.address, {from: owner}), errTypes.revert);
  });

  it("Accepted double cooptation", async() => {
    let assoOrg = await AssoOrg.new();
    // first cooptation
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg.cooptMember(cooptCtr.address, {from: owner});
    // second cooptation
    let cooptCtr2 = await AssoCoopt.new(assoOrg.address, {from: wannabeMemberToo});
    await cooptCtr2.cooptMember();
    await cooptCtr2.cooptMember({from: wannabeMember})
    await assoOrg.cooptMember(cooptCtr2.address, {from: wannabeMemberToo});

    let isMem = await assoOrg.members(wannabeMemberToo);
    assert.isTrue(isMem, "Cooptation has been accepted");
  });

  it("Accepted triple cooptation", async() => {
    let assoOrg = await AssoOrg.new();
    // first cooptation
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg.cooptMember(cooptCtr.address, {from: owner});
    // second cooptation
    let cooptCtr2 = await AssoCoopt.new(assoOrg.address, {from: wannabeMemberToo});
    await cooptCtr2.cooptMember();
    await cooptCtr2.cooptMember({from: wannabeMember})
    await assoOrg.cooptMember(cooptCtr2.address, {from: wannabeMemberToo});
    // third cooptation
    let cooptCtr3 = await AssoCoopt.new(assoOrg.address, {from: wannabeMemberTooToo});
    await cooptCtr3.cooptMember({from: wannabeMemberToo});
    await cooptCtr3.cooptMember({from: wannabeMember})
    await assoOrg.cooptMember(cooptCtr3.address, {from: wannabeMember});

    let isMem = await assoOrg.members(wannabeMemberTooToo);
    assert.isTrue(isMem, "Cooptation has been accepted");
  });

  it("Invalid cooptation organisation reference", async() => {
    let assoOrg = await AssoOrg.new();
    let assoOrgFake = await AssoOrg.new();
    let cooptCtr = await AssoCoopt.new(assoOrgFake.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await tryCatch(assoOrg.cooptMember(cooptCtr.address, {from: owner}), errTypes.revert);
  });

  it("Insufficient cooptations", async() => {
    let assoOrg = await AssoOrg.new();
    // first cooptation OK
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg.cooptMember(cooptCtr.address, {from: owner});
    // first cooptation NOK : needs 51% cooptations
    let cooptCtr2 = await AssoCoopt.new(assoOrg.address, {from: wannabeMemberToo});
    await cooptCtr2.cooptMember({from:wannabeMember});
    await tryCatch(assoOrg.cooptMember(cooptCtr2.address, {from: owner}), errTypes.revert);
  });

  it("Already a member", async() => {
    let assoOrg = await AssoOrg.new();
    // first cooptation OK
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr.cooptMember();
    await assoOrg.cooptMember(cooptCtr.address, {from: owner});
    // second cooptation NOK : already a member
    let cooptCtr2 = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await cooptCtr2.cooptMember({from:wannabeMember});
    await cooptCtr2.cooptMember({from:owner});
    await tryCatch(assoOrg.cooptMember(cooptCtr2.address, {from: owner}), errTypes.revert);
  });

  it("Cooptation of a random guy is not ok", async() => {
    let assoOrg = await AssoOrg.new();
    let cooptCtr = await AssoCoopt.new(assoOrg.address, {from: wannabeMember});
    await tryCatch(cooptCtr.cooptMember.call({from: randomGuy}), errTypes.revert);
  });

});
