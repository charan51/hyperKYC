import React from 'react';
import axios from 'axios';
import { Grid, Select, FormControl, InputLabel, MenuItem, Paper, TextField, Button } from '@material-ui/core';
class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchname: '',
            userName: '',
            org: '',
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
        console.log(this.state);
        const { data: d } = await axios.get(`http://localhost:5001/search?org=${this.state.org}&userName=${this.state.userName}&id=${this.state.searchname}`);
        this.setState({
            res: d.d
        });
    }
    render() {
        return (
            <Grid container direction="column"
                justify="center" 
                alignItems="center">
                <Grid className="inputOptions" item xs={6}>
                    <div><TextField onChange={this.handelChange} name="userName" id="userName" label="User Name" /></div>
                    <div><TextField onChange={this.handelChange} name="searchname" id="searchname" label="Search Name" /></div>
                    <div>
                    <FormControl ><InputLabel className="selectBank" id="demo-simple-select-label">Bank Name</InputLabel>
                        <Select
                            id="selectBank"
                            name="org"
                            value={'age'}
                            onChange={this.handelChange}
                        >
                            <MenuItem value={'citiBank'}>Citi Bank</MenuItem>
                            <MenuItem value={'sbi'}>SBI Bank</MenuItem>
                        </Select>
                        </FormControl>
                    </div>
                    <Button onClick={this.submit} variant="contained">Search</Button>
                    <Paper>

        {this.state.res && <Paper>Found related data on ledger, please raise permission to view data <ul>{this.state.res.map(item => <li><a href={`/query/${item}`}>{item}</a></li>)}</ul></Paper>}
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
export default Search;