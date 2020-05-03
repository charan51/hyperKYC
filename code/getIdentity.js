/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');


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
        const gateway = new Gateway();
        const identity = await wallet.get(userName);
        if (!identity) {
            console.log(`An identity for the user ${userName} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return `An identity for the user ${userName} does not exist in the wallet`;
        }
        await gateway.connect(ccp, { wallet, identity: userName, discovery: { enabled: true, asLocalhost: true } });
        const getIdentity = await gateway.getIdentity();
        if (!identity) {
            console.log(`An identity for the user ${userName} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');
            return `An identity for the user ${userName} does not exist in the wallet`;
        }
        return {user: userName, org: orgName};

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

exports.Identity = main;
