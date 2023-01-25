import { expect, use } from "chai"
import { ethers } from "hardhat"
import { solidity } from "ethereum-waffle"
import * as fs from "fs"
const hre = require("hardhat");
import { deployFile, privateKey } from "../../helper-hardhat-config"
import { Wallet } from "@ethersproject/wallet";
import { BigNumber } from "@ethersproject/bignumber";

describe("priceOracle (integration test)", async () => {
    const { network } = hre
    const oneUnit = BigNumber.from(10).pow(8)
    const priceOracleDeployJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/PriceOracle.json", "utf8"))
    const priceOracleAddress = priceOracleDeployJSON.address

    const wEthDeployJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/WETH.json", "utf8"))
    const wEthAddress = wEthDeployJSON.address
    const wEthDeciaml = 18;
    const wEthPow = BigNumber.from(10).pow(wEthDeciaml);

    const teleBtcDeployJSON = JSON.parse(fs.readFileSync(deployFile + network.name + "/TeleBTC.json", "utf8"))
    const teleBtcAddress = teleBtcDeployJSON.address
    const teleBtcDecimal = 8;
    const teleBtcPow = BigNumber.from(10).pow(teleBtcDecimal);

    const btcUsdChainLinkAddress = "0x007A22900a3B98143368Bd5906f8E17e9867581b"
    const maticUsdChainLinkAddress = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada"

    let signer : Wallet;
    let priceOracle;
    let btcUsdOracle;
    let maticUsdOracle;

    before(async () => {
        signer = new ethers.Wallet(privateKey, ethers.provider);

        // instance of telebtc
        priceOracle = await ethers.getContractAt("PriceOracle", priceOracleAddress, signer)
        btcUsdOracle = await ethers.getContractAt("AggregatorV3Interface", btcUsdChainLinkAddress, signer)
        maticUsdOracle = await ethers.getContractAt("AggregatorV3Interface", maticUsdChainLinkAddress, signer)
    })

    describe("#deployment checks", async () => { 
        it("deployment values are right", async () => {
            await expect(
                await priceOracle.acceptableDelay()
            ).to.not.equal(0)
        })
    })

    describe("#ChainlinkPriceProxy", async () => { 
        it("check chainlink oracle settlements", async () => {

            await expect(
                await priceOracle.ChainlinkPriceProxy(teleBtcAddress)
            ).to.equal(btcUsdChainLinkAddress)

            await expect(
                await priceOracle.ChainlinkPriceProxy(wEthAddress)
            ).to.equal(maticUsdChainLinkAddress)
            
        })

        it("check price from chainlink and price oracle", async () => {

            let maticUsdResp = await maticUsdOracle.latestRoundData()
            let maticUsdChainLinkPrecision = await maticUsdOracle.decimals()
            let maticDecimal = BigNumber.from(10).pow(maticUsdChainLinkPrecision)


            let btcUsdResp = await btcUsdOracle.latestRoundData()
            let btcUsdChainLinkPrecision = await btcUsdOracle.decimals()
            let btcDecimal = BigNumber.from(10).pow(btcUsdChainLinkPrecision)

            let inputAmount = BigNumber.from(10).pow(15).mul(123);

            let price0 = maticUsdResp.answer;
            let price1 = btcUsdResp.answer;

            let calculatedOutputAmount = maticDecimal.mul(price0).mul(inputAmount).mul(teleBtcPow)
            calculatedOutputAmount = calculatedOutputAmount.div(price1).div(btcDecimal).div(wEthPow)

            let outputAmount = await priceOracle.equivalentOutputAmount(
                inputAmount,
                wEthDeciaml,
                teleBtcDecimal,
                wEthAddress,
                teleBtcAddress
            )

            expect(
                outputAmount
            ).to.equal(calculatedOutputAmount)
            
        })
    })
})