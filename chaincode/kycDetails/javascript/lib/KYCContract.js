/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const _ = require('lodash');
class KYCContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // const KYCList = [
        //     {
        //         12334: {
        //             name: "Charan",
        //             gender: "male",
        //             "maritialStatus": "Single",
        //             citizenShip: "Indian",
        //             Occupation: "Service",
        //             POI: {
        //                 type: "Passport",
        //                 number: 121231231232,
        //                 documentFile: 'asdfasdfasdfsadf'
        //             },
        //             POA: {
        //                 type: "AAdar Card",
        //                 number: 'asd1212312321',
        //                 addressType: "Home",
        //                 documentFile: 'asdfasdfasdfsadf'
        //             },
        //             contactDetails: {
        //                 phone: 23242343,
        //                 emial: "dd@dd.com",
        //                 address: {
        //                     state: "karnataka",
        //                     citiy: "bangalore",
        //                     pinecode: 343434,
        //                     address: "asdfasdfasdf"
        //                 }
        //             }
        //         }
        //     }
        // ]


        // for (let i = 0; i < cars.length; i++) {
        //     cars[i].docType = 'car';
        //     await ctx.stub.putState('CAR' + i, Buffer.from(JSON.stringify(cars[i])));
        //     console.info('Added <--> ', cars[i]);
        // }
        console.info('============= END : Initialize Ledger ===========');
    }

    // async queryKyc(ctx, KYCNumber) {
    //     const kycAsBytes = await ctx.stub.getState(KYCNumber); // get the kyc from chaincode state
    //     if (!kycAsBytes || kycAsBytes.length === 0) {
    //         throw new Error(`${KYCNumber} does not exist`);
    //     }
    //     console.log(kycAsBytes.toString());
    //     return kycAsBytes.toString();
    // }
    async queryKyc(ctx, kycNum) {
        const kycAsBytes = await ctx.stub.getState(kycNum); // get the car from chaincode state
        if (!kycAsBytes || kycAsBytes.length === 0) {
            throw new Error(`${kycNum} does not exist`);
        }
        return kycAsBytes.toString();
    }

    async uploadKYC(ctx, KYCNumber, orgName, name, gender, citizenShip, Occupation, aadarNum, address, phone, email, state, city, pincode, permission) {
        console.info('============= START : Create KYC Details ===========');
        const KYC = {
            name: name,
            orgName: orgName,
            gender: gender,
            citizenShip: citizenShip,
            aadarNumber: aadarNum,
            city: city,
            state: state,
            pincode: pincode,
            address: address,
            phone: phone,
            email: email,
            Occupation: Occupation,
            permission: permission,
        };
        await ctx.stub.putState(KYCNumber, Buffer.from(JSON.stringify(KYC)));
        console.info('============= END : Create Car ===========');
    }
    async searchList(ctx, keyword) {
        const startKey = 'KYC1';
        const endKey = 'KYC999';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }

            allResults.push({ [key]: record });
        }
        const showcase = [];
        const temp = _.find(allResults, (val, index) => {
            const resVal = _.findKey(val, { name: keyword });
            if (resVal) {
                showcase.push(resVal);
            }
        });
        return JSON.stringify(showcase);
    }
    async queryAllKyc(ctx) {
        const startKey = 'KYC1';
        const endKey = 'KYC999';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            console.log(value);
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

    async changeKYCStatus(ctx, KYCNumber, orgName) {
       
        const kycAsBytes = await ctx.stub.getState(KYCNumber); // get the car from chaincode state
        if (!kycAsBytes || kycAsBytes.length === 0) {
            throw new Error(`${carNumber} does not exist`);
        }
        let kyc = JSON.parse(kycAsBytes.toString());
        let per = JSON.parse(kyc.permission);
        per = [per, {orgName: orgName, permission: true}]
        kyc.permission = per;
        await ctx.stub.putState(KYCNumber, Buffer.from(JSON.stringify(kyc)));
    }
    async changeCommit(ctx, KYCNumber, data) {
        console.info('============= START : Create KYC Details ===========');
        const KYC = data;
        await ctx.stub.putState(KYCNumber, Buffer.from(JSON.stringify(KYC)));
    }
}

module.exports = KYCContract;
