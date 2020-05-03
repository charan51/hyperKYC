/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main(orgName, userName, department, role) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'kyc-network', `connection-${orgName}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities[`ca.${orgName}.kyc.com`].url;
 
        const ca = new FabricCAServices(caURL);
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), `${orgName}wallet`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(userName);
        if (userIdentity) {
            return `An identity for the user "${userName}" already exists in the wallet`;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return 'Run the enrollAdmin.js application before retrying';
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');
        
        let affiliationService = ca.newAffiliationService();
        // Check if organization exists
        let registeredAffiliations = await affiliationService.getAll(adminUser);
        if (!registeredAffiliations.result.affiliations.some(x => x.name == `${orgName}`)) {
          let affiliation = `${orgName}.${department}`;
          await affiliationService.create({
            name: affiliation,
            force: true
          }, adminUser);
        }
        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: `${orgName}.${department}`,
            enrollmentID: userName,
            role: role
        }, adminUser);
      
        const enrollment = await ca.enroll({
            enrollmentID: userName,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgName.charAt(0).toUpperCase()+orgName.slice(1)}MSP`,
            type: 'X.509',
        };
        await wallet.put(userName, x509Identity);
        return `Successfully registered and enrolled admin user ${userName} and imported it into the wallet`;

    } catch (error) {
        console.error(`Failed to register user ${userName}: ${error}`);
        process.exit(1);
    }
}

exports.EnrollUser = main;
