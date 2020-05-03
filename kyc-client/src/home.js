import React from 'react';
import {Grid, Paper} from '@material-ui/core';
const Home = (props) => {
    return (
        <Grid container spacing={3}>
        <Grid item xs={12}>
          <div className="homeheader"> <h2>Welcome to Decentralized Banking KYC </h2> </div>
        </Grid>
        </Grid>
    );
}
export default Home;