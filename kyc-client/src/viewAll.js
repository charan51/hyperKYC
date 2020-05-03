import React from 'react';
import { Grid, TextField, FormControl, FormLabel, FormControlLabel, Radio, Button, RadioGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import MaterialTable from 'material-table'

// const useStyles = makeStyles((theme) => ({
//     root: {
//         '& .MuiTextField-root': {
//             margin: theme.spacing(1),
//             width: '25ch',
//         },
//     },
// }));

export default class ViewAll extends React.Component {
    constructor(props) {
        super(props);
        const org = localStorage.getItem('org');
        const user = localStorage.getItem('user');
        this.state = {
            org: org !== null && org !== "undefined" ? org : '',
            userName: user !== null && user !== "undefined" ? user : '',
            data: []
        }
        this.submit();
    }
    submit = async () => {
        const { data: d } = await axios.get(`http://localhost:5001/queryAll?org=${this.state.org}&userName=${this.state.userName}`);
        const a = [];
        const res = d.d.forEach(item => {
            a.push(item.Record);
        })
        this.setState({
            data: a
        })
    }
    render() {
        return (
            <Grid container direction="column"
                justify="center"
                alignItems="center">
                <Grid item xs={10} className="leadeerData">

                    <div style={{ maxWidth: '100%' }}>
                        <MaterialTable
                            columns={[
                                { title: 'Customer Name', field: 'name' },
                                { title: 'AddarNumber', field: 'aadarNumber' },
                                { title: 'address', field: 'address'},
                                { title: 'citizenShip', field: 'citizenShip'},
                                { title: 'city', field: 'city'},
                                { title: 'email', field: 'email'},
                                { title: 'gender', field: 'gender'},
                                { title: 'orgName', field: 'orgName'},
                                { title: 'phone', field: 'phone'},
                                { title: 'pincode', field: 'pincode'},
                                { title: 'state', field: 'state'},
                            ]}
                            data={this.state.data}
                            title={`${this.state.org} Ledger Data`}
                        />
                    </div>
                </Grid>
            </Grid>
        );
    }
}