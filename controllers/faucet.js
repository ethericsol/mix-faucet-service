const Web3 = require('web3');
const EthTx = require('ethereumjs-tx');
const config = require('../config.js')

module.exports = {

    donateTo: (toAddr) => { return new Promise(
        
        async (resolve, reject) => {
            
            try {

                const web3 = new Web3(new Web3.providers.HttpProvider(config.web3HttpAddr));
                let GasPrice = await web3.eth.getGasPrice();
                let Nonce = await web3.eth.getTransactionCount(config.publicAddr, 'pending');
                let weiAmount = await web3.utils.toWei(config.donationAmount, "ether");
            
                let rawTx = await {
                    nonce:Nonce,
                    chainId:76,
                    to: toAddr,
                    value: web3.utils.toBN(weiAmount),
                    gas: 25000,
                    gasPrice: web3.utils.toBN(GasPrice)
                };
                let tx = await new EthTx(rawTx);
                
                let privateKey = await new Buffer.from(config.privateKey, 'hex')
                
                await tx.sign(privateKey);
                let serializedTx = await tx.serialize();
                let hexTx = await serializedTx.toString('hex');
                
                web3.eth.sendSignedTransaction('0x'+ hexTx)
                .on('transactionHash', (hash) => {
                    console.log('txhash-', hash)
                    resolve(hash);
                })
                .on('receipt', (receipt) => { 

                })
                .on('error', (error) => {
                    reject(error);
                });

            } catch(e) {
                reject(e);
            }
        
        });
    
    },

    isAddress: (addr)=>{
        const web3 = new Web3();
        return web3.utils.isAddress(addr);
    },

    toCheckSum: (addr) => {
        const web3 = new Web3();
        return web3.utils.toChecksumAddress(addr);
    }

};