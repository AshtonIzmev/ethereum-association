module.exports = {
   networks: {
      development: {
         host: "localhost",
         port: 8545,
         network_id: "1337" // Match any network id
      }
   },
   // See <http://truffleframework.com/docs/advanced/configuration>
   // to customize your Truffle configuration!
   compilers: {
      solc: {
         version: "0.7.0"
      }
   }
};
