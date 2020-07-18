import React from 'react';
import axios from 'axios';
import { Grid, Select, FormControl, InputLabel, MenuItem, Paper, TextField, Button } from '@material-ui/core';
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchname: '',
            userName: localStorage.getItem('user'),
            org: localStorage.getItem('org'),
            res: ''
        }
    }
    handelChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };
    submit = async () => {
        const { data: d } = await axios.get(`http://localhost:5001/search?org=${this.state.org}&userName=${this.state.userName}&id=${this.state.searchname}`);
        console.log(d.d);
        if(d.d.length === 0) {
            this.setState({
                successRes: false,
                res: `No results found for customer ${this.state.searchname}`
            });
        } else {
            this.setState({
                successRes: true,
                res: d.d
            });
        }
        
    }
    render() {
        return (
            <Grid container direction="column"
                justify="center" 
                alignItems="center">
                <Grid className="inputOptions" item xs={6} style={{marginTop:'20px'}}>
                    
                    <div><TextField style={{marginTop:'0px'}} onChange={this.handelChange} name="searchname" id="searchname" label="Search Customer Name" /></div>
                   
                    <Button onClick={this.submit} variant="contained">Search</Button>
                    <Paper>

        {this.state.successRes ? <Paper style={{padding: '10px'}}>Found customer <b>{this.state.searchname}</b> on our ledger, click below link to view data <ul>{this.state.res.map(item => <li><a href={`/query/${item}`}>{item}</a></li>)}</ul></Paper> : <p>{this.state.res}</p>}

                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
export default Search;