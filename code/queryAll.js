/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(orgName, userName) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'kyc-network', `connection-${orgName}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `${orgName}wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userName);
        if (!identity) {
            console.log(`An identity for the user ${userName} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return `An identity for the user ${userName} does not exist in the wallet`;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('kycDetails');


        const result = await contract.evaluateTransaction('queryAllKyc');
        const parsedData = JSON.parse(result);
        const resp = parsedData.filter(item => {
            return item.Record.orgName === orgName
        });
        if(resp) {
            return resp;
        } else {
            return 'No result found';
        }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

exports.QueryAll = main;
