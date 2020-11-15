var AssocOrg = artifacts.require("./AssociationOrg.sol");

module.exports = function(deployer) {
  deployer.deploy(AssocOrg);
};