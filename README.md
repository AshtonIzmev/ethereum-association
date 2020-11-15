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
Le gardien peut à tout moment être déchu par un vote des membres. Le minimum requis des votes pour le changement de gardien est défini dans le contrat blockchain de l'association.
### Auto-destruction
L'association peut s'auto-dissoudre à tout moment par vote des membres. Le minimum requis des votes pour l'auto-destruction est défini dans le contrat blockchain de l'association.  
En cas d'auto-dissolution, l'ensemble des biens dématérialisés de l'association reviennent au gardien.

### Vote
Tout membre de l'association a un droit de vote dans les décisions matérialisées par le contrat blockchain de vote.  
Un vote peut être positif, négatif ou neutre face à une question posée dans un contrat blockchain de vote.

## Gamification
### Bonification d'entrée
Tout nouveau membre se voit accorder lors de sa prise de fonction une bonification de 90 points.  
La bonification diminue d'un point chaque jour.  
L'octroi d'une bonification se fait par un vote des membres de l'association. Le minimum requis pour un vote de bonification est défini dans le contrat blockchain de bonification.  
Une bonification ne peut dépasser la bonification de prise de fonction.
### Raisons de bonification
A titre indicatif, une bonification est octroyée à un membre lorsqu'il :
  * Anime un atelier, une conférence ou une représentation publique en citant l'association
  * Anime ou participe à une formation, présentation ou partage de connaissance destinée aux membres de l'association
  * Donne une partie de son temps à une autre association ou à une administration dans une visée purement désintéressée, tout en mettant en avant l'association

Les membres décident de l'octroi des bonifications, que ce soit le montant ou la raison de l'octroi.


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
Afin de pouvoir tester notre code solidity, il faut une blockchain Ethereum de test. Ganache est là pour ça : On lance  
`ganache-cli -p 8545`  
Le port 8545 a été déclaré dans le fichier _truffle.js_  et permet la fonction entre truffle et ganache.  
Pour lancer les tests, il suffit de se placer dans ./sol/truffle et de lancer :  
`truffle test`

# Ethereum
Afin de déployer le contrat de l'association sur la blockchain, nous utilisons une instance _semi-privée_ d'Ethereum avec un cout de gas égal à 0.  
Cette blockchain a plusieurs particularités :
  * Son utilisation est gratuite (le cout du gas est 0)
  * Elle est d'initiative marocaine puisque contrôlée par des membres marocains
  * La monnaie générée (de l'ether marocain) n'est pas mis en circulation publique par les mineurs, par conséquent il n'y a pas de monnaie numérique, seulement la partie distributed ledger publique

Pourquoi avons-nous choisi de ne pas utiliser la vraie blockchain publique Ethereum ?
  * La blockchain publique Ethereum nécessite de la devise pour acheter de l'Ether et du Gas. La détention d'Ether et de Gas est assimilable à la détention d'avoirs à l'étranger ce que nous voulons éviter.
  * Le coût d'une transaction Ethereum reste élevé (varient de 3 à 50 dhs) car le réseau n'est pas scalable (mais des initiatives prometteuses avancent pour résoudre ce problème)

Pour participer à notre réseau Ethereum, vous vous engagez à ne pas mettre en circulation d'Ether miné afin de ne pas déroger à l'esprit de la blockchain comme "grand ordinateur distribué". La conséquence logique est qu'il n'y a pas de rémunération pour le travail de mining.