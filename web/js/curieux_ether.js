function setBalance(w3, account) {
    w3.eth.getBalance(account, function (err, balance) {
        $("#accountAddress").html("Votre adresse public / compte Ethereum: " + account + " avec un solde de " + w3.utils.fromWei(balance, 'ether') + "ETH");
    });
}
async function refreshEther() {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                setBalance(web3, account);
            }
        });
    });
};

function getEther() {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                $.getJSON('https://curieux.ma/getether/' + account)
                .done(function (data) {
                    $("#received-ether").append("<p> 1 Ether reçu. Récepissé de la transaction : " + data.response.split('\n')[0] + ". Il sera visible dans une dizaine de secondes")
                    $('.toast-header').text("Envoi d'Ether");
                    $('.toast-body').text("Envoi d'ether à l'adresse réussi");
                    $('.toast').toast({ 'delay': 2000 }).toast('show');
                    setTimeout(refreshEther, 5000);
                    setTimeout(refreshEther, 10000);
                    setTimeout(refreshEther, 15000);
                    setTimeout(refreshEther, 20000);
                })
                .fail(function (jqxhr, textStatus, error) {
                    $('.toast-header').text("Envoi d'Ether");
                    if (jqxhr.responseJSON) {
                        if (jqxhr.responseJSON.data) {
                            $('.toast-body').text(jqxhr.responseJSON.data.stack.split('t.')[0]);
                        }
                        if (jqxhr.responseJSON.response) {
                            $('.toast-body').text(jqxhr.responseJSON.response);
                        }
                    } else {
                        $('.toast-body').text("Une erreur est survenue");
                    }
                    $('.toast').toast({ 'delay': 10000 }).toast('show');
                    console.log("error");
                })
            }
        });
    });
}