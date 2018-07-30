# Réseau Ethereum semi privé

# Creation du premier noeud
## Gensis
Le fichier genesis.json contient les informations pour initier le réseau Ethereum.

## Installation de geth
Les instructions suivantes permettent de l'installer sous Ubuntu : https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu  

## Lancer une instance d'Ethereum
Il faut tout d'abord initialiser le premier block :  
`ETHDIR=./eth &&  geth --datadir ${ETHDIR}/data init ${ETHDIR}/genesis.json`

On définit un bootnode pour relier les instances entre elles, avec les deux commandes suivantes :  
`bootnode --genkey=boot.key && bootnode --nodekey=boot.key`  
Le fichier boot.key est créé. Une url _enode_ est affichée et sera utilisée pour la connection des instances au bootnode.

̀`ETHDIR=./eth && BOOTNODEIP="localhost" && geth --datadir ${ETHDIR}/data --networkid 2120212  --bootnodes enode://1fa9c35e6c7b73075a2a9cdaa76e20035f92c82c91d53a1a481560e8630ac1b221d6f23544c2f5d8f2dfd4a46c950496c3b75dd9505ccd567aa7ee2bdfd4466e@${BOOTNODEIP}:30301`


Puis on lance l'instance :  
̀`ETHDIR=./eth &&  geth --datadir ${ETHDIR}/data --networkid 2120212 --mine --nodiscover --minerthreads 1 --gasprice "0" --port 32313 --etherbase=0x0000000000000000000000000000000000000000`


De la documentation se trouve ici : https://github.com/ethereum/go-ethereum/wiki/Setting-up-private-network-or-local-cluster et ici : https://github.com/ethereum/go-ethereum/wiki/Private-network
