let { TeleportDaoPayment } = require("@sinatdt/bitcoin")

let tdp = new TeleportDaoPayment("bitcoin_testnet")
let mnemonic = "jungle raccoon faculty anxiety bracket explain satoshi run gun false provide twenty"
let addressType = "p2wpkh"
tdp.setAccountPrivateKeyByMnemonic({
    mnemonic,
    index: 1,
    addressType,
})
tdp.setAccount(addressType)

let lockerAddress = "2N8JDhrLqtwZ4MGC1QAcwyiQg3v6ffhCrJb"

exports.normalCCTransfer = async (amount, recipientAddress) => {
    let deadline = Math.ceil(new Date().getTime() / 1000 + 3600)
    let transferRequest = {
        changeAddress: tdp.currentAccount,
        lockerAddress,
        amount,
        recipientAddress,
        percentageFee: 4, // 2 bytes in satoshi
        chainId: 3,
        appId: 0,
        speed: 0, // 1 byte
        // exchange
        isExchange: false,
        exchangeTokenAddress: undefined,
        outputAmount: undefined,
        isFixedToken: false,
        deadline,
        feeSpeed: "normal",
    }
    let txId = await tdp.transferBitcoinToEth(transferRequest)
    console.log(txId)
    let requestProof = await tdp.btcInterface.getRequestProof({
        txId: "txId",
    })
    console.log(requestProof)

    return {
        txId,
        requestProof
    }
}

exports.tdp = tdp;
exports.tdpAccount = tdp.currentAccount;
