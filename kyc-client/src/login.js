import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

import { Grid, Select,FormControl, InputLabel, MenuItem, Paper, TextField, Button } from '@material-ui/core';
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      org: '',
      res: '',
      success: false
    }
  }
  handelChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };
  submit = async () => {
    const { data: d } = await axios.get(`http://localhost:5001/identity?org=${this.state.org}&userName=${this.state.userName}`);
    
    if (d.d !== 'An identity for the user asdf does not exist in the wallet') {
      localStorage.setItem('user', d.d.user);
      localStorage.setItem('org', d.d.org);
      this.setState({
        res:'An identity for the user asdf does not exist in the wallet',
        success: false
      });
    } else {
      this.setState({
        success: true
      });
    }
  }
  render() {
    return (
      <Grid container direction="column"
        justify="center"
        alignItems="center">
        <Grid className="inputOptions" item xs={6}>
          <div><h2>Login Now</h2></div>
          <div><TextField onChange={this.handelChange} name="userName" id="userName" label="Username" /></div>
          <div >  <FormControl ><InputLabel className="selectBank" id="demo-simple-select-label">Bank Name</InputLabel><Select
            id="selectBank"
            name="org"
            value={this.state.org}
            onChange={this.handelChange}
          >
            <MenuItem value={'citiBank'}>Citi Bank</MenuItem>
            <MenuItem value={'sbi'}>SBI Bank</MenuItem>
          </Select>
          </FormControl>
          </div>
          <div><Button onClick={this.submit} variant="contained">Login In</Button></div>
          <Paper>
            <div>
            {this.state.res}
            {
              localStorage.getItem('user') !== "undefined" && localStorage.getItem("user") !== null && <Redirect to={'/'} />
            }
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}
export default Login;