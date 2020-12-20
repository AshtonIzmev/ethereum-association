const ethereumHost = '209.250.236.210'
const ethereumPort = '8545'

/////////////////////////
// DICTIONNARIES
/////////////////////////

const gasGlobal = 6054108;
const gasPriceGlobal = '2000000000';

eraseBtn1 = '  <button type="button" class="btn btn-danger" style="padding: 0;" onclick="removeFromStore(';
eraseBtn2 = ');location.reload();"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></button>';

var dictLib = {
    "0": "est un bannissement de membre",
    "2": "est une dissolution d'association",
    "3": "est une cooptation",
    "4": "est un referendum",
    "1": "est un changement de propriétaire"
};

var dictSeuil = {
    "0": 51,
    "2": 67,
    "3": 50,
    "4": 51,
    "1": 51
};

var dictContract = {
    "0": "AssociationAdministrationMemberban.json",
    "2": "AssociationAdministrationSelfdestruct.json",
    "3": "AssociationAdministrationCooptation.json",
    "4": "AssociationAdministrationReferendum.json",
    "1": "AssociationAdministrationOwnerchange.json"
};

var dictType = {
    "0": "bans",
    "2": "dissolutions",
    "3": "cooptations",
    "4": "referendums",
    "1": "ownerchanges"
};

var dictMethods = {
    "0": "handleMemberbanAction",
    "2": "handleSelfdestructAction",
    "3": "handleCooptationAction",
    "4": "handleReferendumAction",
    "1": "handleOwnerchangeAction"
};

function toggleBlock(str) {
    $(".recevoir-hide").toggle(str == "recevoir");
    $(".creer-hide").toggle(str == "creer");
    $(".rechercher-hide").toggle(str == "rechercher");
    $(".gerer-hide").toggle(str == "gerer");
    $(".details-hide").toggle(str == "details");
    $(".histo-hide").toggle(str == "historique");
}

/////////////////////////
// TOAST FUNCTIONS
/////////////////////////

function showToastGeneric(libHead, libBody, delay) {
    $('.toast-header').text(libHead);
    $('.toast-body').text(libBody);
    $('.toast').toast({ 'delay': delay }).toast('show');
};

function showToast() {
    showToastGeneric("Recherche d'association", "Merci de renseigner une adresse valide", 5000)
};

function showToastAdmin() {
    showToastGeneric("Recherche d'un contrat d'administration", "Merci de renseigner une adresse valide", 5000)
};

function showToastInvalidAdmin() {
    showToastGeneric("Recherche d'un contrat d'administration", "Merci de choisir un type de contrat", 5000)
};

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

/////////////////////////
// LOCAL STORAGE
/////////////////////////

var keyLocalStorage = "events_v0.3";
var emptyRes = '{"r":[]}';

function getStore() {
    return window.localStorage.getItem(keyLocalStorage) || emptyRes;
};

function addToStore(assoc, typeStore) {
    var current = window.localStorage.getItem(keyLocalStorage) || emptyRes;
    dicur = JSON.parse(current);
    dicur['r'].push((assoc + '|' + new Date().toISOString() + "|" + typeStore));
    window.localStorage.setItem(keyLocalStorage, JSON.stringify(dicur));
};

function addRechercheToStore(assoc, typeStore) {
    var current = window.localStorage.getItem(keyLocalStorage) || emptyRes;
    dicur = JSON.parse(current);
    var ind = dicur['r'].map(x => x.split("|")[0]).indexOf(assoc);
    if (ind > -1) {
        return;
    }
    dicur['r'].push((assoc + '|' + new Date().toISOString() + "|" + typeStore));
    window.localStorage.setItem(keyLocalStorage, JSON.stringify(dicur));
};

function removeFromStore(assoc) {
    var current = window.localStorage.getItem(keyLocalStorage) || emptyRes;
    dicur = JSON.parse(current);
    var ind = dicur['r'].map(x => x.split("|")[0]).indexOf(assoc);
    if (ind > -1) {
        dicur['r'].splice(ind, 1);
    }
    window.localStorage.setItem(keyLocalStorage, JSON.stringify(dicur));
};

function addAssociationToStore(assoc) { addToStore(assoc, "association"); };
function addCooptationToStore(assoc) { addToStore(assoc, "cooptation"); };
function addBanToStore(assoc) { addToStore(assoc, "ban"); };
function addDissolutionToStore(assoc) { addToStore(assoc, "dissolution"); };
function addOwnerChangeToStore(assoc) { addToStore(assoc, "ownerchange"); };
function addReferendumToStore(assoc) { addToStore(assoc, "referendum"); };

function loadHistoric() {
    var eventList = JSON.parse(getStore())['r'];
    $("#event-histo").html("");
    eventList.forEach(function (a) {
        var tuple = a.split("|");
        if (!tuple[2].startsWith("r_")) {
            $("#event-histo").append(
                "<p>"
                + tuple[2].charAt(0).toUpperCase() + tuple[2].slice(1)
                + " <a title='Charger "
                + tuple[2]
                + "' href='#reche' onclick='"
                + (tuple[2] == "association" ? "seekHistoricAssociation" : "seekHistoricAdminContract")
                + "(\"" + tuple[0] + "\")'>"
                + tuple[0] + "</a> <span class='creaevent'>créée</span> à "
                + tuple[1] 
                + eraseBtn1
                + "'" + tuple[0] + "'" 
                + eraseBtn2
                + "</p>"
            );
        } else {
            $("#event-histo").append(
                "<p>"
                + tuple[2].charAt(2).toUpperCase() + tuple[2].slice(3)
                + " <a title='Charger "
                + tuple[2]
                + "' href='#reche' onclick='"
                + (tuple[2] == "r_association" ? "seekHistoricAssociation" : "seekHistoricAdminContract")
                + "(\"" + tuple[0] + "\")'>"
                + tuple[0] + "</a> <span class='rechevent'>recherchée</span> à "
                + tuple[1] 
                + eraseBtn1
                + "'" + tuple[0] + "'" 
                + eraseBtn2
                + "</p>"
            );
        }
    });
};

/////////////////////////
// ETHEREUM GENERICS
/////////////////////////

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

async function main() {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                web3.eth.getBalance(account, function (err, balance) {
                    $("#accountAddress").html("Votre adresse public / compte Ethereum: " + account + " avec un solde de " + web3.utils.fromWei(balance, 'ether') + "ETH");
                    web3.eth.net.getNetworkType().then(function(tp) {
                        if (tp == "private") {
                            web3.eth.net.getId().then(function(id) {
                                if (id == "985459") {
                                    $(".container").show();
                                    $("#network-problem").hide();
                                }
                            });
                        }
                    });
                });
            }
        });
    });
    $('.toast').toast({ 'delay': 2000 });
    loadHistoric();
};

async function refreshEther() {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err === null) {
                web3.eth.getBalance(account, function (err, balance) {
                    $("#accountAddress").html("Votre adresse public / compte Ethereum: " + account + " avec un solde de " + web3.utils.fromWei(balance, 'ether') + "ETH");
                });
            }
        });
    });
};

function getContractAdminJson() {
    var defaultCtrType = "AssociationAdministrationCooptation.json";
    return $("#admin-select").text() == "" ? defaultCtrType : dictContract[$("#admin-select").text()];
}

function getCtrObj(add, jsonContract, fun) {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (!add) {
                showToast();
                return;
            }
            if (err !== null) {
                console.log(error);
                return;
            }
            $.getJSON('contracts/' + jsonContract, function (data) {
                let abi = data['abi'];
                var ctr;
                try {
                    ctr = new web3.eth.Contract(abi, add, {
                        from: account,
                    });
                } catch (error) {
                    showToastAdmin();
                    return;
                };
                fun(ctr, account);
            });
        });
    });
};

function createAssociation() {
    var assocName = $("#name-assoc").val();
    var memberName = $("#member-name-assoc").val();
    if (assocName == "" || memberName == "") {
        showToastGeneric("Création d'association", "Merci de renseigner un nom d'association et votre pseudonyme", 3000);
        return;
    }
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err !== null) {
                console.log(error);
                return;
            }
            $.getJSON('contracts/AssociationOrg.json', function (data) {
                let abi = data['abi'];
                let bytecode = data['bytecode'];
                let ctr = new web3.eth.Contract(abi);
                ctr.deploy({
                    data: bytecode,
                    arguments: [assocName, memberName]
                })
                    .send({
                        from: account,
                        gas: gasGlobal,
                        gasPrice: gasPriceGlobal
                    }, function (error, transactionHash) { console.log(transactionHash); })
                    .on('error', function (error) {
                        console.log(error);
                        $('.toast-header').text("Création d'association");
                        $('.toast-body').text("Une erreur est survenue lors de la création");
                        $('.toast').toast({ 'delay': 3000 }).toast('show');
                        $("#created-assoc-statut").html("<p> Erreur lors de la création du contrat d'association. Merci de réessayer </p>")
                    })
                    .on('transactionHash', function (transactionHash) {
                        $("#created-assoc-statut").html("<p>La demande de création d'association a bien été reçue</p><p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
                    })
                    .on('receipt', function (receipt) { })
                    .on('confirmation', function (confirmationNumber, receipt) { console.log(confirmationNumber); })
                    .then(function (newContractInstance) {
                        var d = new Date();
                        var ds = d.toISOString().slice(11, 19);
                        addAssociationToStore(newContractInstance.options.address);
                        $("#created-assoc-statut").html("")
                        $('.toast-header').text("Création d'association");
                        $('.toast-body').text("Un contrat d'association a bien été créé à l'adresse " + newContractInstance.options.address);
                        $('.toast').toast({ 'delay': 2000 }).toast('show');
                        $("#created-assoc").append("<p> Association créée à l'adresse <span class='bold'>" + newContractInstance.options.address + "</span> à " + ds + "</p>");
                        loadHistoric();
                    });
            });
        });
    });
};

function createAdmin(args, ctrJson, callback_success, typeStr, statuId) {
    getWeb3().then((web3) => {
        web3.eth.getCoinbase(function (err, account) {
            if (err !== null) {
                console.log(error);
                return;
            }
            $.getJSON('contracts/' + ctrJson, function (data) {
                let abi = data['abi'];
                let bytecode = data['bytecode'];
                let ctr = new web3.eth.Contract(abi);
                ctr.deploy({
                    data: bytecode,
                    arguments: args
                })
                    .send({ 
                        from: account,
                        gas: gasGlobal,
                        gasPrice: gasPriceGlobal
                    }, function (error, transactionHash) { console.log(transactionHash); })
                    .on('error', function (error) {
                        console.log(error);
                        $('.toast-header').text(typeStr);
                        $('.toast-body').text("Une erreur est survenue lors de la création de ce contrat");
                        $('.toast').toast({ 'delay': 3000 }).toast('show');
                        $("#" + statuId).html("<p> Erreur lors de la création du contrat de " + typeStr.toLowerCase() + ". Merci de réessayer </p>");
                    })
                    .on('transactionHash', function (transactionHash) {
                        $("#" + statuId).html("<p>La demande de " + typeStr.toLowerCase() + " a bien été reçue</p> <p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
                        console.log(transactionHash);
                    })
                    .on('receipt', function (receipt) { })
                    .on('confirmation', function (confirmationNumber, receipt) { console.log(confirmationNumber); })
                    .then(function (data) {
                        $("#" + statuId).html("");
                        callback_success(data);
                        loadHistoric();
                    });
            });
        })
    })
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

/////////////////////////
// SEEK ASSOCIATION
/////////////////////////

function seekAssociation() {
    var address = $("#seek-assoc").val();
    seekHistoricAssociation(address);
};

function seekHistoricAssociation(address) {
    $("#seek-assoc").val(address);
    getCtrObj(address, "AssociationOrg.json", handleSeekAssociation);
};

function handleSeekAssociation(ctrAsso, account) {
    var address = $("#seek-assoc").val();
    if (!ctrAsso) { $("#seek-assoc").val(""); return; }
    addRechercheToStore(address, "r_association");
    loadHistoric();
    ctrAsso.methods.owner().call().then(function (pdt) {
        toggleBlock("details");
        $("#details-assoc").show();
        $("#addassoc").text(address);
        $("#president").text(pdt);
        var ismyassoc = pdt.toLocaleLowerCase() != account.toLocaleLowerCase();
        $(".myassoc").toggle(ismyassoc);
        $(".seassoc").toggle(!ismyassoc);
    }).catch(function (error) { showToast(); console.log(error); return; });

    ctrAsso.methods.name().call().then(function (name) {
        $("#name-seek-assoc").html(escapeXml(name));
    }).catch(function (error) { showToast(); console.log(error); return; });

    ctrAsso.methods.members(account).call().then(function (isMember) {
        $(".ismember").toggle(isMember);
        $(".notmember").toggle(!isMember);
    }).catch(function (error) { showToast(); console.log(error); return; });

    ctrAsso.methods.membersCount().call().then(function (nb) {
        $("#nbmembers").text(nb)
    }).catch(function (error) { showToast(); console.log(error); return; });

    ctrAsso.methods.getReferendumsCount().call().then(function (nb) {
        $("#referendum-list").html("");
        if (nb > 0) {
            $("#referendum-list").append("<p>" + nb + " question(s) votée(s)</p>");
            for (i = 0; i < nb; i++) {
                ctrAsso.methods.referendums(i).call().then(function (q) {
                    $("#referendum-list").append("<p><span class='bold'>" + escapeXml(q) + "</span> : OUI </p>");
                }).catch(function (error) { showToast(); console.log(error); return; });
            }
        }
    }).catch(function (error) { showToast(); console.log(error); return; });

    ctrAsso.methods.getMemberHistoricCount().call().then(function (nb) {
        $("#member-list").html("");
        $("#member-list").append("<p>Membres (vous pouvez proposer le bannissement) :</p>");
        for (i = 0; i < nb; i++) {
            ctrAsso.methods.membersHistoric(i).call().then(function (mh) {
                ctrAsso.methods.members(mh.addr).call().then(function (isMember) {
                    if (isMember) {
                        $("#member-list").append('<p><span class="bold">' + escapeXml(mh.name) + '</span> - ' + escapeXml(mh.addr) + '</span> <button type="button" class="btn btn-danger" style="padding: 0;" onclick="specificMemberBan(\'' + mh.addr + '\');">Bannir</button> </p>');
                    }
                }).catch(function (error) { showToast(); console.log(error); return; });
            }).catch(function (error) { showToast(); console.log(error); return; });
        }
    }).catch(function (error) { showToast(); console.log(error); return; });
};

function setMemberCountForVote(address, nbV, seuil) {
    getCtrObj(address, "AssociationOrg.json", function(ctr, account) {
        ctr.methods.membersCount().call().then(function (nb) {
            $("#details-admin-membercount").text(" sur " + nb + " membre(s) soit " + 100*nbV/nb + "%");
            if (100*nbV >= seuil*nb) { 
                $("#seuil-enough").show();
            }
        }).catch(function (error) { showToast(); console.log(error); return; });
    });
};

function chooseIfCanVote(address) {
    getCtrObj(address, "AssociationOrg.json", function(ctr, account) {
        ctr.methods.members(account).call().then(function (isMember) {
            if (isMember) {
                $("#can-vote").show();
            }
        }).catch(function (error) { showToast(); console.log(error); return; });
    });
};

/////////////////////////
// CREATE ADMIN CONTRACT
/////////////////////////

function becomeOwner() {
    function logOK(addObj) {
        var add = addObj.options.address;
        console.log(add)
        $('.toast-header').text("Changement de président");
        $('.toast-body').text("Un contrat de changement de président a bien été créé à l'adresse " + add);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#become-owner").html("<p class='bold'> Contrat de changement de propriétaire créé à l'adresse " + add + "</p>");
        addOwnerChangeToStore(add);
    }
    createAdmin([$("#addassoc").text()], "AssociationAdministrationOwnerchange.json", logOK, "Changement de président", "become-owner-statut");
};

function joinAssociation() {
    if ($("#become-member-name").val() == "") {
        showToastGeneric("Demande de cooptation", "Merci de renseigner votre pseudonyme", 3000);
        return;
    }
    function logOK(addObj) {
        var add = addObj.options.address;
        console.log(add)
        $('.toast-header').text("Demande de cooptation");
        $('.toast-body').text("Un contrat de cooptation a bien été créé à l'adresse " + add);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#become-member").html("<p class='bold'> Contrat de changement de cooptation créé à l'adresse " + add + "</p>");
        addCooptationToStore(add);
    }
    createAdmin([$("#addassoc").text(), $("#become-member-name").val()], "AssociationAdministrationCooptation.json", logOK, "Cooptation de membre", "become-member-statut");
};

function specificMemberBan(account) {
    if (account == "") {
        return;
    }
    function logOK(addObj) {
        var add = addObj.options.address;
        console.log(add)
        $('.toast-header').text("Bannissement d'un membre");
        $('.toast-body').text("Un contrat de bannissement d'un membre a bien été créé à l'adresse " + add);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#member-ban").html("<p class='bold'>Le contrat d'un bannissement d'un membre de l'association choisie est créé à l'adresse " + add + "</p>");
        addBanToStore(add);
    }
    createAdmin([$("#addassoc").text(), account], "AssociationAdministrationMemberban.json", logOK, "Bannissement d'un membre", "member-ban-statut");
};

function sendReferendum() {
    if ($("#ask-referendum-question").val() == "") {
        return;
    }
    function logOK(addObj) {
        var add = addObj.options.address;
        console.log(add)
        $('.toast-header').text("Referendum");
        $('.toast-body').text("Un contrat de referendum a bien été créé à l'adresse " + add);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#ask-referendum").html("<p class='bold'>Contrat de referendum pour les membres de l'association choisir est créé à l'adresse " + add + "</p>");
        addReferendumToStore(add);
    }
    createAdmin([$("#addassoc").text(), $("#ask-referendum-question").val()], "AssociationAdministrationReferendum.json", logOK, "Referendum", "ask-referendum-statut");
};

function selfDestruct() {
    function logOK(addObj) {
        var add = addObj.options.address;
        console.log(add)
        $('.toast-header').text("Dissolution de l'association");
        $('.toast-body').text("Un contrat de dissolution de l'association a bien été créé à l'adresse " + add);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#destroy-assoc").html("<p class='bold'> Contrat de dissolution de l'association créé à l'adresse " + add + "</p>");
        addDissolutionToStore(add);
    }
    createAdmin([$("#addassoc").text()], "AssociationAdministrationSelfdestruct.json", logOK, "Dissolution de l'association", "destroy-assoc-statut");
};

/////////////////////////
// HANDLE ADMIN CONTRACT
/////////////////////////

function handleSeekAdminContract(ctrAdmin, account) {
    var adminAddress = $("#seek-admin").val();
    if (!ctrAdmin) { $("#seek-admin").val(""); return; }
    addRechercheToStore(adminAddress, "r_administration");
    loadHistoric();
    ctrAdmin.methods.getAdminActionType().call().then(function (tp) {
        toggleBlock("gerer");
        if (tp != $("#admin-select").text()) {
            $("#admin-select").text(tp);
            seekAdminContract();
            return;
        }

        $("#details-admin").show();
        $("#addadmin-admin").text(adminAddress);
        $("#details-admin-type").text(dictLib[tp]);

        ctrAdmin.methods.proposedMember().call().then(function (member) {
            $("#details-admin-member").text("");
            var detailLib = "";
            if (member != "0x0000000000000000000000000000000000000000" && tp != "4" && tp != 2) {
                detailLib += " concernant la personne " + member;
            }
            if (tp == "4") {
                ctrAdmin.methods.referendumQuestion().call().then(function (q) {
                    $("#details-admin-member").text(detailLib + ". Question : " + q);
                }).catch(function (error) { console.log(error); return; });
            } else if (tp == "3") {
                ctrAdmin.methods.memberName().call().then(function (n) {
                    $("#details-admin-member").text(detailLib + ". Peudonyme : " + n);
                }).catch(function (error) { console.log(error); return; });
            } else {
                $("#details-admin-member").text(detailLib);
            }
        }).catch(function (error) { console.log(error); return; });

        ctrAdmin.methods.voteCount().call().then(function (nbVote) {
            $("#details-admin-vote").text(nbVote);
            $("#details-admin-seuil").text("(seuil requis : " + dictSeuil[tp] + "%)");
            ctrAdmin.methods.assoCtr().call().then(function (add) {
                $("#addassoc-admin").text(add);
                setMemberCountForVote(add, nbVote, dictSeuil[tp]);
                ctrAdmin.methods.didVotes(account).call().then(function (didVote) {
                    $("#details-admin-didvote").text(didVote ? ". Vous avez déjà voté pour" : "");
                    if (!didVote) {
                        chooseIfCanVote(add);
                    }
                }).catch(function (error) { showToast(); console.log(error); return; });
            }).catch(function (error) { showToast(); console.log(error); return; });
        }).catch(function (error) { showToast(); console.log(error); return; });

        ctrAdmin.methods.assoCtr().call().then(function (add) {
            $("#vote-list").html("");
            getCtrObj(add, "AssociationOrg.json", function(ctrAsso, account) {
                ctrAsso.methods.getMemberHistoricCount().call().then(function (nb) {
                    $("#vote-list").append("<p>Votes :</p>");
                    for (i = 0; i < nb; i++) {
                        ctrAsso.methods.membersHistoric(i).call().then(function (mh) {
                            ctrAdmin.methods.didVotes(mh.addr).call().then(function (hasVoted) {
                                ctrAsso.methods.members(mh.addr).call().then(function (isMember) {
                                    if (isMember) {
                                        $("#vote-list").append('<p><span class="bold">' + escapeXml(mh.name) + '</span> - ' + escapeXml(mh.addr) + ' ' + (hasVoted ? 'A VOTE OUI': '') + '</p>');
                                    }
                                }).catch(function (error) { console.log(error); return; });
                            }).catch(function (error) { console.log(error); return; });
                        }).catch(function (error) { console.log(error); return; });
                    }
                }).catch(function (error) { console.log(error); return; });
            });
        }).catch(function (error) { console.log(error); return; });



        
    }).catch(function (error) { showToast(); console.log(error); return; });
};

function seekAdminContract() {
    var adminAddress = $("#seek-admin").val();
    seekHistoricAdminContract(adminAddress);
};

function seekHistoricAdminContract(address) {
    $("#seek-admin").val(address);
    getCtrObj(address, getContractAdminJson(), handleSeekAdminContract);
}

function handleVoteAdminContract(ctr, account) {
    if (!ctr) { $("#seek-admin").val(""); return; }
    ctr.methods.vote().send({
        from: account,
        gas: gasGlobal,
        gasPrice: gasPriceGlobal
    }, function (error, transactionHash) {
        console.log(transactionHash);
    })
        .on('transactionHash', function (transactionHash) {
            $("#vote-status").html("<p>La tentative de vote a bien été reçue</p> <p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
            console.log(transactionHash);
        })
        .on('receipt', function (receipt) { })
        .on('confirmation', function (confirmationNumber, receipt) { console.log(confirmationNumber); })
        .on('error', function (error, receipt) {
            console.log(error);
            $('.toast-header').text("Tentative de vote");
            $('.toast-body').text("Une erreur est survenue lors du vote pour ce contrat");
            $('.toast').toast({ 'delay': 3000 }).toast('show');
            $("#vote-status").html("<p> Erreur lors du vote. Merci de réessayer </p>");
        })
        .then(function (data) {
            $("#vote-status").text("Votre vote a bien été comptabilisé");
            seekAdminContract();
        });
};

function voteForAdminContract() {
    var adminAddress = $("#seek-admin").val();
    getCtrObj(adminAddress, getContractAdminJson(), handleVoteAdminContract);
};


function handleActAdminContract(ctr, account) {
    if (!ctr) { $("#seek-admin").val(""); return; }
    ctr.methods[dictMethods[$("#admin-select").text()]]($("#seek-admin").val()).send({
        from: account,
        gas: gasGlobal,
        gasPrice: gasPriceGlobal
    }, function (error, transactionHash) {
        console.log(transactionHash);
    })
        .on('transactionHash', function (transactionHash) {
            $("#act-status").html("<p>La tentative d'action sur l'association a bien été reçue</p> <p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
            console.log(transactionHash);
        })
        .on('receipt', function (receipt) { })
        .on('confirmation', function (confirmationNumber, receipt) { console.log(confirmationNumber); })
        .on('error', function (error, receipt) {
            console.log(error);
            $('.toast-header').text("Tentative d'application du contrat");
            $('.toast-body').text("Une erreur est survenue lors de l'action pour ce contrat");
            $('.toast').toast({ 'delay': 3000 }).toast('show');
            $("#act-status").html("<p> Erreur lors de l'action. Merci de réessayer </p>");
        })
        .then(function (data) {
            $("#act-status").text("Action réussie. L'association a bien été impactée");
            seekAdminContract();
            removeFromStore($("#seek-admin").val());
            loadHistoric();
        });
};

function actAdminContract() {
    var adminAddress = $("#addassoc-admin").text();
    getCtrObj(adminAddress, "AssociationOrg.json", handleActAdminContract);
}

window.addEventListener('load', main);
