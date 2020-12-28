function onCreateAssociationBtn() {
    var assocName = $("#name-assoc").val();
    var memberName = $("#member-name-assoc").val();
    if (assocName == "" || memberName == "") {
        showToastGeneric("Création d'association", "Merci de renseigner un nom d'association et votre pseudonyme", 3000);
        return;
    }
    function errorCallback(error) {
        console.log(error);
        $('.toast-header').text("Création d'association");
        $('.toast-body').text("Une erreur est survenue lors de la création");
        $('.toast').toast({ 'delay': 3000 }).toast('show');
        $("#created-assoc-statut").html("<p> Erreur lors de la création du contrat d'association. Merci de réessayer </p>");
    };
    function transactionHashCallback(transactionHash) {
        $("#created-assoc-statut").html("<p>La demande de création d'association a bien été reçue</p><p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
    };
    function finalCallback(contractInstance) {
        var d = new Date();
        var ds = d.toISOString().slice(11, 19);
        addAssociationToStore(contractInstance.options.address);
        $("#created-assoc-statut").html("")
        $('.toast-header').text("Création d'association");
        $('.toast-body').text("Un contrat d'association a bien été créé à l'adresse " + contractInstance.options.address);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#created-assoc").append("<p> Association créée à l'adresse <span class='bold'>" + contractInstance.options.address + "</span> à " + ds + "</p>");
        loadHistoric();
    }
    createContract([assocName, memberName], 'AssociationOrg.json', errorCallback, transactionHashCallback, finalCallback);
}

/////////////////////////
// CREATE ADMIN CONTRACT
/////////////////////////

function createAdmin(deploymentArgs, jsonContract, successCallback, typeStr, statutId) {

    function errorCallback(error) {
        console.log(error);
        $('.toast-header').text(typeStr);
        $('.toast-body').text("Une erreur est survenue lors de la création de ce contrat");
        $('.toast').toast({ 'delay': 3000 }).toast('show');
        $("#" + statutId).html("<p> Erreur lors de la création du contrat de " + typeStr.toLowerCase() + ". Merci de réessayer </p>");
    }

    function transactionHashCallback(transactionHash) {
        console.log(transactionHash);
        $("#" + statutId).html("<p>La demande de " + typeStr.toLowerCase() + " a bien été reçue</p> <p>Merci de patienter une dizaine de secondes</p> <div class='spinner-border' role='status'><span class='sr-only'>Loading...</span></div> ");
    }

    function finalCallback(contractInstance) {
        $("#" + statutId).html("");
        successCallback(contractInstance);
        loadHistoric();
    }
    createContract(deploymentArgs, jsonContract, errorCallback, transactionHashCallback, finalCallback);
};

function onBecomeOwner() {
    function sucessCallback(contractInstance) {
        var contractAddress = contractInstance.options.address;
        $('.toast-header').text("Changement de président");
        $('.toast-body').text("Un contrat de changement de président a bien été créé à l'adresse " + contractAddress);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#become-owner").html("<p class='bold'>Le contrat de changement de propriétaire est créé à l'adresse suivante " + contractAddress + " à partager manuellement aux membres de l'association pour qu'ils votent pour votre mandat.</p>");
        addOwnerChangeToStore(contractAddress);
    }
    createAdmin([$("#addassoc").text()], "AssociationAdministrationOwnerchange.json", sucessCallback, "Changement de président", "become-owner-statut");
};


function onJoinAssociation() {
    if ($("#become-member-name").val() == "") {
        showToastGeneric("Demande de cooptation", "Merci de renseigner votre pseudonyme", 3000);
        return;
    }
    function sucessCallback(contractInstance) {
        var contractAddress = contractInstance.options.address;
        $('.toast-header').text("Demande de cooptation");
        $('.toast-body').text("Un contrat de cooptation a bien été créé à l'adresse " + contractAddress);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#become-member").html("<p class='bold'>Le contrat de changement de cooptation est créé à l'adresse " + contractAddress + " à partager manuellement aux membres de l'association pour qu'ils votent pour votre adhésion.</p>");
        addCooptationToStore(contractAddress);
    }
    createAdmin([$("#addassoc").text(), $("#become-member-name").val()], "AssociationAdministrationCooptation.json", sucessCallback, "Cooptation de membre", "become-member-statut");
};

function onSpecificMemberBan(account) {
    if (account == "") {
        return;
    }
    function sucessCallback(contractInstance) {
        var contractAddress = contractInstance.options.address;
        $('.toast-header').text("Bannissement d'un membre");
        $('.toast-body').text("Un contrat de bannissement d'un membre a bien été créé à l'adresse " + contractAddress);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#member-ban").html("<p class='bold'>Le contrat d'un bannissement est créé à l'adresse " + contractAddress + " à partager manuellement aux membres de l'association pour qu'ils votent pour le bannissement.</p>");
        addBanToStore(contractAddress);
    }
    createAdmin([$("#addassoc").text(), account], "AssociationAdministrationMemberban.json", sucessCallback, "Bannissement d'un membre", "member-ban-statut");
};


function onSendReferendum() {
    if ($("#ask-referendum-question").val() == "") {
        return;
    }
    function sucessCallback(contractInstance) {
        var contractAddress = contractInstance.options.address;
        $('.toast-header').text("Referendum");
        $('.toast-body').text("Un contrat de referendum a bien été créé à l'adresse " + contractAddress);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#ask-referendum").html("<p class='bold'>Le contrat de referendum est créé à l'adresse " + contractAddress + " à partager manuellement aux membres de l'association pour qu'ils votent pour votre question.</p>");
        addReferendumToStore(contractAddress);
    }
    createAdmin([$("#addassoc").text(), $("#ask-referendum-question").val()], "AssociationAdministrationReferendum.json", sucessCallback, "Referendum", "ask-referendum-statut");
};

function onSelfDestruct() {
    function sucessCallback(contractInstance) {
        var contractAddress = contractInstance.options.address;
        $('.toast-header').text("Dissolution de l'association");
        $('.toast-body').text("Un contrat de dissolution de l'association a bien été créé à l'adresse " + contractAddress);
        $('.toast').toast({ 'delay': 2000 }).toast('show');
        $("#destroy-assoc").html("<p class='bold'>Le contrat de dissolution de l'association est créé à l'adresse " + contractAddress + " à partager manuellement aux membres de l'association pour qu'ils votent pour la destruction.</p>");
        addDissolutionToStore(contractAddress);
    }
    createAdmin([$("#addassoc").text()], "AssociationAdministrationSelfdestruct.json", sucessCallback, "Dissolution de l'association", "destroy-assoc-statut");
};
