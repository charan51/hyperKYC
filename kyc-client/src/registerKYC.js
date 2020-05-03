import React from 'react';
import { Grid, TextField, FormControl, FormLabel, FormControlLabel, Radio, Button, RadioGroup } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
// const useStyles = makeStyles((theme) => ({
//     root: {
//         '& .MuiTextField-root': {
//             margin: theme.spacing(1),
//             width: '25ch',
//         },
//     },
// }));

export default class RegisterKYC extends React.Component {
    constructor(props) {
        super(props);
        const org = localStorage.getItem('org');
        const user = localStorage.getItem('user');
        this.state = {
            org: org !== null && org !== "undefined" ? org : '',
            userName: user !== null && user !== "undefined" ? user : '',
            name: '',
            gender: '',
            CountryName: '',
            Occupation: '',
            AaadarNumber: '',
            Address: '',
            PhoneNumber: '',
            Email: '',
            State: '',
            City: '',
            PinCode: '',
        }
    }
    onChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    }
    submit = async () => {
        console.log(this.state);
        const {data:d} = await axios.post('http://localhost:5001/invoke', {org: this.state.org, userName:this.state.userName,...this.state});
        this.setState({
            res: d.d
        });
    }
    render() {
        // const classes = useStyles();

        return (
            <Grid container direction="column"
                justify="center"
                alignItems="center">
                <Grid item xs={6} style={{marginBottom: '100px', marginTop: '30px'}}>
                    <h2>Register New Customer</h2>
                    <form noValidate autoComplete="off">
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="name" label="Customer Name" />
                        </div>
                        <div className="formRadio">
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Select your Gender</FormLabel>
                                <RadioGroup aria-label="gender" name="gender" value={this.state.gender} onChange={this.onChange}>
                                    <FormControlLabel
                                        value="male"
                                        control={<Radio color="primary" />}
                                        label="Male"
                                        labelPlacement="Male"
                                    />
                                    <FormControlLabel
                                        value="female"
                                        control={<Radio color="primary" />}
                                        label="Female"
                                        labelPlacement="Female"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="citizenShip" label="Country Name" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="Occupation" label="Occupation" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="aadarNumber" label="Aaadar Number" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="address" label="Address" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="phone" label="Phone Number" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="email" label="Email" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="state" label="State" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="city" label="City" />
                        </div>
                        <div>
                            <TextField id="standard-search" onChange={this.onChange} name="pincode" label="PinCode" />
                        </div>
                        <div className="formRadio">
                            <Button  onClick={this.submit} variant="contained">Add</Button>
                        </div>
                    </form>
                    {this.state.res && this.state.res}
                </Grid>
            </Grid>
        );
    }
}