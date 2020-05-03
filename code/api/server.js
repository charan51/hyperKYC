const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 5001;
const AdminEnroll = require('../enrollAdmin').EnrollAdmin;
const UserEnroll = require('../registerUser').EnrollUser;
const Invoke = require('../invoke').Invoke;
const Search = require('../searchKYC').Search;
const Query = require('../query').Query;
var cors = require('cors');
const ChangepermissionOrg = require('../changePermission').permissionOrg;
const QueryAll = require('../queryAll').QueryAll;
const Identity = require('../getIdentity').Identity;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})
AdminEnroll('citiBank');
AdminEnroll('sbi');
// Register Admin
app.get('/enrollAdmin', async (req, res) => {
    const { org } = req.query;
    if (org) {
        const d = await AdminEnroll(org);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
// Enroll users role
app.get('/enrollUser', async (req, res) => {
    const { org, userName, department, role } = req.query;
    if (org && userName && department && role) {
        const d = await UserEnroll(org,userName,department,role);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
// Invoke to ledger
app.post('/invoke', async (req, res) => {
    const {org, userName, name, gender, citizenShip, Occupation, aadarNum, address, phone, email, state, city, pincode} = req.body;
    if (org && userName) {
        const d = await Invoke(org, userName, name, gender, citizenShip, Occupation, aadarNum, address, phone, email, state, city, pincode);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
app.get('/identity', async (req, res) => {
    const { org, userName } = req.query;
    console.log(req.query);
    if (org && userName) {
        const d = await Identity(org, userName);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
// Query All ledger Data
app.get('/queryall', async (req, res) => {
    const { org, userName } = req.query;
    if (org && userName) {
        const d = await QueryAll(org, userName);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
  });
// Query single ledger Data
app.get('/query', async (req, res) => {
    const { org, userName, id } = req.query;
    if (org && userName && id) {
        const d = await Query(org, userName, id);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
app.get('/search', async (req, res) => {
    const { org, userName, id } = req.query;
    if (org && userName && id) {
        const d = await Search(org, userName, id);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});
app.get('/getPermission', async (req, res) => {
    const { org, userName, kycNumber,permissionOrgName } = req.query;
    if (org && userName && kycNumber&& permissionOrgName) {
        const d = await ChangepermissionOrg(org, userName, kycNumber, permissionOrgName);
        res.json({ d }).status(200);
    } else {
        res.status(400);
    }
});

app.listen(PORT, () => {
    console.log('App is running on PORT: ', PORT);
});