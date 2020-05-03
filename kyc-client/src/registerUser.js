import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import { Grid, Select, MenuItem, Paper, TextField, Button } from '@material-ui/core';
class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            org: 'select a organization',
            res: '',
            department: ''
        }
    }
    handelChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };
    submit = async () => {
        console.log(this.state);
        const { data: d } = await axios.get(`http://localhost:5001/enrollUser?org=${this.state.org}&userName=${this.state.userName}&department=${this.state.department}&role=client`);
        this.setState({
            res: d.d
        });
    }
    render() {
        return (
            <Grid container direction="column"
                justify="center"
                alignItems="center">
                <Grid item xs={6}>
                    <div><TextField onChange={this.handelChange} name="userName" id="userName" label="Username" /></div>
                    <div>
                        <Select
                            id="selectBank"
                            name="org"
                            value={'age'}
                            onChange={this.handelChange}
                        >
                            <MenuItem value={'citiBank'}>Citi Bank</MenuItem>
                            <MenuItem value={'sbi'}>SBI Bank</MenuItem>
                        </Select>
                    </div>
                    <div>
                        <Select
                            id="department"
                            name="department"
                            value={this.state.department}
                            onChange={this.handelChange}
                        >
                            <MenuItem value={'managment'}>Managment Department</MenuItem>
                            <MenuItem value={'sales'}>Sales Department</MenuItem>
                            <MenuItem value={'it'}>IT Department</MenuItem>
                            <MenuItem value={'network'}>Network Department</MenuItem>
                        </Select>
                    </div>
                    <Button onClick={this.submit} variant="contained">Register In</Button>
                <div>
                    <Paper>
                        {
                            this.state.res && this.state.res
                        }
                    </Paper>
                </div>
                </Grid>
            </Grid>
        );
    }
}
export default Register;