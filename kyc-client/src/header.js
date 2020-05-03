import React from 'react';
import { Grid, Paper, Typography, Link } from '@material-ui/core';
const Home = (props) => {
    const preventDefault = (event) => event.preventDefault();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className="header">
                    <div>
                        <h1>HyperLedger KYC {localStorage.getItem("org") !== "undefined" && localStorage.getItem("org") !== null && <span> For {localStorage.getItem('org')}</span>}</h1>
                    </div>
                    <Typography className="header-body">
                        <Link href="/">
                            Home
                    </Link>
                        {localStorage.getItem("user") !== "undefined" && localStorage.getItem("user") !== null &&
                            <div className="customH">
                                <Link href="/registerKYC">
                                    New KYC
                    </Link>
                                <Link href="/viewAll">
                                    View All
                    </Link>
                                <Link href="/register">
                                    Register User
                    </Link>
                                <Link href="/searchKYC">
                                    Search Customer
                    </Link>
                            </div>
                        }
                        {localStorage.getItem("user") !== "undefined" && localStorage.getItem("user") !== null ? <Link href="#" onClick={() => localStorage.clear()}>
                            Logout
                        </Link> : <Link href="/login">
                                Login
                        </Link>}

                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
}
export default Home;