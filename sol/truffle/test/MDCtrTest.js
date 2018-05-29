const MDOrg = artifacts.require("MDOrg");

contract('MDOrg', async (accounts) => {
 
  let tryCatch = require("./exceptions.js").tryCatch;
  let errTypes = require("./exceptions.js").errTypes;

  let mdSimpleOrg;
  let owner         = accounts[0];
  let nonOwner      = accounts[1];
  let wannabeMember = accounts[5];

  before(async() => {
    mdSimpleOrg = await MDOrg.new();
  });

  it("should make the creator of the contract the owner", async() => {
    let _owner = await mdSimpleOrg.owner();
    assert.equal(_owner, owner, "Owner is the creator of the contract");
  })

  it("We should have only one member at start", async() => {
    let memCount = await mdSimpleOrg.membersCount();
    assert.equal(memCount, 1, "Only one member");
  })

  it("Owner is a member :)", async() => {
    let isMem = await mdSimpleOrg.members(owner);
    let amIMem = await mdSimpleOrg.amIMember();
    assert.isTrue(isMem, "Owner is a member");
    assert.isTrue(amIMem, "Owner is a member");
  })

  it("Others are not members :)", async() => {
    let isMem = await mdSimpleOrg.members(nonOwner);
    let amIMem = await mdSimpleOrg.amIMember.call({from: nonOwner});
    assert.isFalse(isMem, "Other is not a member");
    assert.isFalse(amIMem, "Other is not a member");
  })

  it("Maintenance mode can be activated by owner", async() => {
    let maintenanceModeBefore = await mdSimpleOrg.maintenanceMode();
    await mdSimpleOrg.switchMaintenanceMode();
    let maintenanceModeAfter = await mdSimpleOrg.maintenanceMode();
    await mdSimpleOrg.switchMaintenanceMode();
    assert.isFalse(maintenanceModeBefore, "Maintenance mode is not activated before");
    assert.isTrue(maintenanceModeAfter, "Maintenance mode is activated after");
  })

  it("Maintenance mode cannot be activated by non owner", async() => {
    let maintenanceModeBefore = await mdSimpleOrg.maintenanceMode();
    await tryCatch(mdSimpleOrg.switchMaintenanceMode({from:nonOwner}), errTypes.revert);
    let maintenanceModeAfter = await mdSimpleOrg.maintenanceMode();
    assert.isFalse(maintenanceModeBefore, "Maintenance mode is not activated before");
    assert.isFalse(maintenanceModeAfter, "Maintenance mode is not activated after");
  })

})
