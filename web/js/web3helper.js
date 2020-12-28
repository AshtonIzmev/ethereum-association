async function getWeb3() {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
            return web3;
        } catch (error) {
            console.error(error);
        }
    } else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log('Injected web3 detected.');
        return web3;
    } else {
        const provider = new Web3.providers.HttpProvider('http://' + ethereumHost + ':' + ethereumPort);
        const web3 = new Web3(provider);
        console.log('No web3 instance injected, using Local web3.');
        return web3;
    }
};

async function applyFuncToDeployedContract(contractAddress, jsonContract, callbackFunc) {
    if (!contractAddress) {
        showToast();
        return;
    }
    let web3 = await getWeb3();
    let account = await getPrimaryAccount();
    $.getJSON('contracts/' + jsonContract, function (data) {
        let abi = data['abi'];
        var ctr;
        try {
            ctr = new web3.eth.Contract(abi, contractAddress, { from: account });
        } catch (error) {
            showToastAdmin();
            return;
        };
        callbackFunc(ctr, account);
    });
};

async function getContractObject(contractAddress, jsonContract) {
    if (!contractAddress) {
        showToast();
        return;
    }
    let web3 = await getWeb3();
    let account = await getPrimaryAccount();
    let jsonData = await $.getJSON('contracts/' + jsonContract);
    let abi = jsonData['abi'];
    var ctr;
    try {
        ctr = new web3.eth.Contract(abi, contractAddress, { from: account });
    } catch (error) {
        showToastAdmin();
        return null;
    };
    return ctr;
};

async function createContract(deploymentArgs, jsonContract, errorCallback, transactionHashCallback, finalCallback) {
    let web3 = await getWeb3();
    let account = await getPrimaryAccount();
    $.getJSON('contracts/' + jsonContract, function (data) {
        let abi = data['abi'];
        let bytecode = data['bytecode'];
        let ctr = new web3.eth.Contract(abi);
        ctr.deploy({ data: bytecode, arguments: deploymentArgs })
        .send({ from: account, gas: gasGlobal, gasPrice: gasPriceGlobal}, function (error, transactionHash) { })
        .on('error', errorCallback)
        .on('transactionHash', transactionHashCallback)
        .on('receipt', function (receipt) { })
        .on('confirmation', function (confirmationNumber, receipt) { })
        .then(finalCallback);
    });
};

async function callContractMethod(contractObject, methodTypeArg, methodCallArg, transactionHashCallback, errorCallback, finalCallback) {
    let account = await getPrimaryAccount();
    var call;
    if (methodCallArg) {
        call = contractObject.methods[methodTypeArg](methodCallArg);
    } else {
        call = contractObject.methods[methodTypeArg]();
    }
    call.send({
        from: account,
        gas: gasGlobal,
        gasPrice: gasPriceGlobal
    }, function (error, transactionHash) {
        console.log(transactionHash);
    })
        .on('transactionHash', transactionHashCallback)
        .on('receipt', function (receipt) { })
        .on('confirmation', function (confirmationNumber, receipt) { })
        .on('error', errorCallback)
        .then(finalCallback);
}

async function getPrimaryAccount() {
    let web3 = await getWeb3();
    return web3.eth.getCoinbase();
}

async function getContractValueWiArg(contractObject, methodTypeArg, methodCallArg) {
    return contractObject.methods[methodTypeArg](methodCallArg).call();
}

async function getContractValueWoArg(contractObject, methodTypeArg) {
    return contractObject.methods[methodTypeArg]().call();
}