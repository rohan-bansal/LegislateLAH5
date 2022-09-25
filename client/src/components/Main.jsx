import React from "react";
import axios from "axios";

const senators = require('./senators');

class Main extends React.Component {
    constructor(props) {
        super((props));
        this.state = {
            name: null, topic: null, location: null, coords: null, state: null, names: [], senators: [],
            categories: ["Taxes", "Abortion Access", "Minimum Wage", "Gun Control", "LGBTQ+ Rights", "Mail in Ballots", "Cybersecurity", "Marijuana", "Affirmative Action", "Government Funded Health Insurance"],
            sentiments: [],
        };

        this.submitName = this.submitName.bind(this);
        this.changeName = this.changeName.bind(this);
        this.changeLocation = this.changeLocation.bind(this);
        this.submitLocation = this.submitLocation.bind(this);
    }

    getSenators() {
        // axios.get(process.env.REACT_APP_CONGRESS_URL + "member" + process.env.REACT_APP_CONGRESS_CONFIG + process.env.REACT_APP_CONGRESS_TOKEN)
        axios.get("https://api.congress.gov/v3/member?api_key=" + "2EOUCzGD2RjDH8oLxXcMffEEWRpT3q5tKIKX1ctY")
            .then((res) => {
                console.log(res.data);
            });
    }

    sendToServer() {
        axios.post(process.env.REACT_APP_SERVER_URL + "retriveStancesByLegislator", { name: this.state.name })
            .then((res) => {
                this.setState({ sentiments: res.data });
            });
    }

    changeName(e) {
        this.setState({ name: e.target.value });
    }

    submitName(e) {
        e.preventDefault()
        this.sendToServer();
    }

    changeLocation(e) {
        this.setState({ location: e.target.value });
    }

    submitLocation(e) {
        e.preventDefault();
        axios.get(process.env.REACT_APP_MAPBOX_URL + this.state.location + process.env.REACT_APP_MAPBOX_FORWARD_CONFIG + process.env.REACT_APP_MAPBOX_TOKEN)
            .then((res) => {
                let coords = res.data.features[0].center;
                this.setState({ coords: coords });
                axios.get(process.env.REACT_APP_OPENSTATES_URL + "lat=" + coords[1] + "&lng=" + coords[0] + process.env.REACT_APP_OPENSTATES_CONFIG + process.env.REACT_APP_OPENSTATES_TOKEN)
                    .then((res) => {
                        let results = res.data.results;
                        let array = [];
                        results.forEach(element => {
                            // names.push(element.name);
                            // console.log(element.name);
                            array.push(element.name);
                            // this.setState({ names: this.state.names.concat([element.name]) });
                        });
                        this.setState({ names: array });
                        axios.get(process.env.REACT_APP_MAPBOX_URL + coords[0] + "," + coords[1] + process.env.REACT_APP_MAPBOX_BACKWARD_CONFIG + process.env.REACT_APP_MAPBOX_TOKEN)
                            .then((res) => {
                                let stateCode = res.data.features[0].context[4].short_code.substr(3, 2);
                                this.setState({ state: res.data.features[0].context[4].text });
                                let array = [];
                                senators.forEach(element => {
                                    if (element.terms[0].type == "sen" && element.terms[0].state == stateCode) {
                                        array.push(element.name.official_full);
                                    }
                                    this.setState({ senators: array });
                                });
                            });
                    });
            });
        // console.log(this.state.names);
        // console.log(this.state.senators);
    }

    render() {
        return (
            <div className="min-h-screen text-center bg-gray-800 text-white">
                <h1 className="h-1"></h1>
                <div className="text-center bg-green-400 mx-auto my-10 w-2/3 px-20 py-10 rounded-2xl">
                    <h1 className="mx-auto w-fit text-4xl pb-10">What Does Your Legislator Truly Think?</h1>
                    <p>
                        What legislators say on Twitter or in rallies often doesn't align with their true political views.
                        Legislators have motivation to present themselves in ways that lead to their re-election.
                        However, informed citizens should know the true sentiments of their representatives.
                        Thus, it's important to analyze how lawmakers actually voted on bills to give you the most accurate information.
                        Look up your legislator below and see what they truly think and how they truly represnt you.
                        Now go forth and stay informed!
                    </p>
                </div>
                <div className="text-center">
                    <div>
                        <input onChange={this.changeName} className="rounded-2xl text-center w-1/4 m-10 text-black" placeholder="Legislator Name"></input>
                        <button onClick={this.submitName} >Submit Entry</button>
                    </div>

                    or

                    <div>
                        <input onChange={this.changeLocation} className="rounded-2xl text-center w-1/4 m-10 text-black" placeholder="Home Address"></input>
                        <button onClick={this.submitLocation} className="">Get By Location</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;