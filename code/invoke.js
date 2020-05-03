/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main(orgName, userName, name, gender, citizenShip, Occupation, aadarNum, address, phone, email, state, city, pincode) {
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
        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
        const result = await contract.evaluateTransaction('queryAllKyc');
        const parsedData = JSON.parse(result);
        
        let kycNum = parsedData.length+1;
        const contractData = await contract.submitTransaction('uploadKYC', `KYC${kycNum}`, `${orgName}`, `${name}`, `${gender}`, `${citizenShip}`, `${Occupation}`, `${aadarNum}`, `${address}`, `${phone}`, `${email}`, `${state}`, `${city}`, `${pincode}`, JSON.stringify({
            orgName: orgName,
            permission: true
        }));
        console.log('Transaction has been submitted');
        // Disconnect from the gateway.
        await gateway.disconnect();
        return `Transaction has been submitted: ${contractData}`

    } catch (error) {
        console.log(error);
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

exports.Invoke = main;
