import React from 'react';
import { Grid, TextField,InputLabel, FormControl,Select, MenuItem, FormLabel, FormControlLabel, Radio, Button, RadioGroup } from '@material-ui/core';
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
            data: [],
            selectedOrg:'',
            msg: null
        }
        this.submit();
    }
    submit = async () => {
        const { data: d = null } = await axios.get(`http://localhost:5001/query?org=${this.state.org}&userName=${this.state.userName}&id=${this.props.match.params.kycID}`);
        const a = [];
        console.log(d);
        if (!d.d.status) {
            if(d.d === Object(d.d)){
                
                this.setState({
                    data: [d.d]
                })
            }else {
                const res = d.d.forEach(item => {
                    a.push(item);
                })
                this.setState({
                    data: a
                })
            }
           
        } else {

            this.setState({
                data: [],
                msg: 'You do not have permission to view KYC data'
            })
        }
    }
    getPermission = async () => {
        const { data: d } = await axios.get(`http://localhost:5001/getPermission?org=${this.state.org}&userName=${this.state.userName}&kycNumber=${this.props.match.params.kycID}&permissionOrgName=${localStorage.getItem('org') === 'citiBank' ? 'sbi' :'citiBank'}`);
        
    }
    handelChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };
    render() {
        return (
            <Grid container direction="column"
                justify="center"
                alignItems="center">
                <Grid item xs={10} className="leadeerData">
                {this.state.msg && 
                <div><h2>{this.state.msg} </h2>
                <div><Button style={{marginBottom:'20px'}} variant="contained" color="secondary" onClick={this.getPermission}> {this.props.match.params.kycID} Data Permission</Button></div>
                            
                        </div>}
                    <div style={{ maxWidth: '100%' }}>
                        <MaterialTable
                            columns={[
                                { title: 'Customer Name', field: 'name' },
                                { title: 'AddarNumber', field: 'aadarNumber' },
                                { title: 'address', field: 'address' },
                                { title: 'citizenShip', field: 'citizenShip' },
                                { title: 'city', field: 'city' },
                                { title: 'email', field: 'email' },
                                { title: 'gender', field: 'gender' },
                                { title: 'orgName', field: 'orgName' },
                                { title: 'phone', field: 'phone' },
                                { title: 'pincode', field: 'pincode' },
                                { title: 'state', field: 'state' },
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