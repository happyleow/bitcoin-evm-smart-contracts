import { expect, use } from "chai"
import { ethers } from "hardhat"
import { solidity } from "ethereum-waffle"
import * as fs from "fs"
const hre = require("hardhat");
import { deployFile, privateKey, lockerTargetAddress } from "../../helper-hardhat-config"
import { Wallet } from "@ethersproject/wallet";
import { BigNumber } from "@ethersproject/bignumber";
import { normalCCTransfer } from "./teleportDaoPayment.js"

describe.only("cc transfer router (integration test)", async () => {
    // Constants
    let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const oneUnit = BigNumber.from(10).pow(8)
    const ratio = 10000;

    const { network } = hre
    const ccTransferJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/CCTransferRouter.json", "utf8"))
    const ccTransferAddress = ccTransferJSON.address

    const teleBTCDeployJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/TeleBTC.json", "utf8"))
    const teleBTCAddress = teleBTCDeployJSON.address

    const lockersDeployJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/LockersProxy.json", "utf8"))
    const lockersAddress = lockersDeployJSON.address

    let signer : Wallet;
    let ccTransferRouter;
    let teleBTC;
    let lockers;
    let lockerLockingScript;

    let recepientAddress = "0x1DE72A1935Df9b4E02315BDa3C3cDbDF2A640583"

    before(async () => {
        signer = new ethers.Wallet(privateKey, ethers.provider);

        // instance of cc transfer router
        ccTransferRouter = await ethers.getContractAt("CCTransferRouter", ccTransferAddress, signer)

        // instance of telebtc
        teleBTC = await ethers.getContractAt("TeleBTC", teleBTCAddress, signer)

        // instance of lockers
        lockers = await ethers.getContractAt("LockersLogic", lockersAddress, signer)
        lockerLockingScript = await lockers.getLockerLockingScript(lockerTargetAddress)

        // check deployments values
        await expect(await ccTransferRouter.teleBTC()).to.equal(teleBTCAddress)
        await expect(await ccTransferRouter.treasury()).to.not.equal(signer.address)

    })

    describe("#cc transfer ", async () => { 
        it("normal cc transfer", async () => {
            let tx;
            let inputAmount = 10;
            let request = await normalCCTransfer(inputAmount, recepientAddress);
            console.log(request)
            // let protocolFee;
            // let teleporterFee;
            // let treasuryAddress = await ccTransferRouter.treasury()

            // let recepientCurrentBalance = await teleBTC.balanceOf(recepientAddress)
            // let treasuryCurrentBalance = await teleBTC.balanceOf(treasuryAddress)
            // let teleporterCurrentBalance = await teleBTC.balanceOf(signer.address)
            // let teleBTCTotalSupply = await teleBTC.totalSupply()

            // // check transaction is not submitted
            // await expect(await ccTransferRouter.isUsed[request.txId]).to.equal(false)

            // // extract proof
            // let proof = request.requestProof
            // // submit the transaction in cc transfer
            // tx = await ccTransferRouter.ccTransfer(
            //     proof.version,
            //     proof.vin,
            //     proof.vout,
            //     0,
            //     proof.blockNumber,
            //     proof.merkleProof.intermediateNodes,
            //     proof.merkleProof.transactionIndex,
            //     lockerLockingScript
            // )
            // await tx.wait(1)

            // // check transaction is submitted
            // await expect(await ccTransferRouter.isUsed[request.txId]).to.equal(true)

            // // check teleBTC transfers
            // await expect(await teleBTC.totalSupply()).to.equal(teleBTCTotalSupply.add(inputAmount))
            // await expect(await teleBTC.balanceOf(recepientAddress)).to.equal(recepientCurrentBalance.add(inputAmount - protocolFee - teleporterFee))
            // await expect(await teleBTC.balanceOf(treasuryAddress)).to.equal(treasuryCurrentBalance.add(protocolFee))
            // await expect(await teleBTC.balanceOf(signer.address)).to.equal(teleporterCurrentBalance.add(teleporterFee))
        })

        it("instant cc transfer", async () => {
        })
    })
})