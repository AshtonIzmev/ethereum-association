# Association Ethereum

## Définition
Une association hébergée dans la blockchain doit refléter l'organisation dans la vie réelle et doit fournir les mêmes garanties que dans celle-ci. Le vote lors des assemblées générales doit être sécurisé. La signature des procès verbaux doit être légalisée par les membres. La vie de l'association doit être transparente et accessible facilement.

Organiser la vie d'une association est adapté à son hébergement dans une blockchain, et plus précisement dans Ethereum.

### Adhésion
L'adhésion à l'association se fait via une cooptation par un vote des membres existants. Le minimum requis de vote pour une cooptation réussie est défini par le contrat blockchain de l'association.  L'adhésion d'un membre lui ouvre tous les droits de l'association au même titre que les autres membres.
### Exclusion
L'exclusion de l'association se fait également par un vote des membres actuels de l'association. Le minimum requis des votes est défini dans le contrat blockchain de l'association. Toute exclusion n'est pas définitive, la réintégration pouvant être réalisée sous la forme d'une première adhésion.
### Gardien du temple
Un *owner* technique est élu par les membres et est responsable du suivi des contrats blockchain de l'association ainsi que de la suspension de ceux-ci.  
Le gardien peut à tout moment être remplacé par un vote des membres. Le minimum requis des votes pour le changement de gardien est défini dans le contrat blockchain de l'association.
### Auto-destruction
L'association peut s'auto-dissoudre à tout moment par vote des membres. Le minimum requis des votes pour l'auto-destruction est défini dans le contrat blockchain de l'association.  
En cas d'auto-dissolution, l'ensemble des biens dématérialisés de l'association reviennent au gardien.

### Vote
Tout membre de l'association a un droit de vote dans les décisions matérialisées par le contrat blockchain de vote.  
Un vote peut être positif, négatif ou neutre face à une question posée dans un contrat blockchain de vote.

# Getting started
## Dev suite
### Node
Installer la suite Node https://nodejs.org/en/  
Sous Ubuntu, suivre les steps suivants : https://doc.ubuntu-fr.org/nodejs  
Vérifier l'installation via  
`node -v && npm -v`
### Suite Etherem
Installer Truffle  
`npm install -g truffle`

Installer ganache-cli  
`npm install -g ganache-cli`

## Compiler et tester
Afin de pouvoir tester notre code solidity, il faut une blockchain Ethereum de test. Ganache est là pour ça : On lance dans *./sol/truffle*
`ganache-cli -p 8545 --networkId 1338`  
Le port 8545 a été déclaré dans le fichier _truffle.js_  et permet la fonction entre truffle et ganache.  
Pour lancer les tests, il suffit de se placer dans ./sol/truffle et de lancer :  
`truffle test`

# TODO
* Ajouter le nom d'une personne cooptée
* Lister les associations crées
* Lister les actes en cours
