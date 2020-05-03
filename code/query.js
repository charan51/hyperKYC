/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
async function main(orgName, userName, id) {
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

        const result = await contract.evaluateTransaction('queryKyc', id.toString());
        const parsedResponse = JSON.parse(result);
        
        var a = '';
        if(Array.isArray(parsedResponse.permission)) {
         a = _.some(parsedResponse.permission, {orgName: orgName, permission: true});
        } else {
            a = _.some(JSON.parse(parsedResponse.permission), (val) => {
           
                return JSON.parse(parsedResponse.permission).orgName === orgName;
            });
        }
        if(a) {
            return parsedResponse;
        } else {
            return {status: true, msg: 'Please raise permission to view KYC data'};
        }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

exports.Query = main;
