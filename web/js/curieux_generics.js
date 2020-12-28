const ethereumHost = '209.250.236.210'
const ethereumPort = '8545'
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
