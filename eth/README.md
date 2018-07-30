# Réseau Ethereum semi privé

# Creation du premier noeud
## Gensis
Le fichier genesis.json contient les informations pour initier le réseau Ethereum.

## Installation de geth
Les instructions suivantes permettent de l'installer sous Ubuntu : https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu  

## Lancer une instance d'Ethereum
Se placer dans le dossier eth, créer le dossier _data_ puis initialiser le premier block :  
`ETHDIR=. && geth --datadir ${ETHDIR}/data init ${ETHDIR}/genesis.json`

Puis on lance l'instance avec la console :  
̀`ETHDIR=. &&  geth --datadir ${ETHDIR}/data --nodiscover --networkid 2120212 --port 32313 --rpcport 8543 -verbosity 6 console 2>> ${ETHDIR}/01.log`  
Normalement, il n'y a pas de peers :
`admin.peers`  
Pour trouver l'enode de l'instance :  
`admin.nodeInfo`

Pour lancer un miner :  
̀`ETHDIR=. &&  geth --datadir ${ETHDIR}/data --networkid 2120212 --mine --etherbase=0x2120212212021221202122120212212021202120 --nodiscover --minerthreads 1 --gasprice "0" --port 32313 --rpcport 8543`
Comme vous pouvez le constatez, l'ether est envoyé sur une adresse non accessible (composée de 212). Il est impératif de respecter cette règle.

## Se connecter à un noeud d'Ethereum
Refaire les deux premières étapes précédentes pour obtenir la console.  
`admin.addPeer("enode://pubkey@127.0.0.1:32313")`

Pour rendre l'ajout de ce peer persistant, utiliser le fichier _data/geth/static-nodes.json_  
`["enode://pubkey1@ip:port", "enode://pubkey2@ip:port"]`

## Autoriser l'ajout d'un Ethereum
Ouvrir le port de l'ip cible afin d'autoriser celle-ci à se connecter.

De la documentation se trouve ici : https://github.com/ethereum/go-ethereum/wiki/Setting-up-private-network-or-local-cluster et ici : https://github.com/ethereum/go-ethereum/wiki/Private-network
