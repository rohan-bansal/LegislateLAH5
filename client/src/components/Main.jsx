import React from "react";
import axios from "axios";
import Title from "./Title";
import Blurb from "./Blurb";

const senators = require('./senators');
const end = React.createRef();
const top = React.createRef();
// var dummy = false;
var displayName, display;


class Main extends React.Component {
    constructor(props) {
        super((props));
        this.state = {
            name: null, topic: null, location: null, coords: null, state: null, names: [], senators: [], moved: false,
            categories: ["Taxes", "Abortion Access", "Minimum Wage", "Gun Control", "LGBTQ+ Rights", "Mail in Ballots", "Cybersecurity", "Marijuana", "Affirmative Action", "Government Funded Health Insurance"],
            sentiments: [], render: [false, false, false, false, false, false, false, false, false, false], displayName: null, dropDown1: null, dropDown2: null, dropDown3: null,
        };

        this.submitName = this.submitName.bind(this);
        this.changeName = this.changeName.bind(this);

        this.changeLocation = this.changeLocation.bind(this);
        this.submitLocation = this.submitLocation.bind(this);

        this.sendToServer = this.sendToServer.bind(this);

    }

    //unused
    getSenators() {
        // axios.get(process.env.REACT_APP_CONGRESS_URL + "member" + process.env.REACT_APP_CONGRESS_CONFIG + process.env.REACT_APP_CONGRESS_TOKEN)
        axios.get("https://api.congress.gov/v3/member?api_key=" + "2EOUCzGD2RjDH8oLxXcMffEEWRpT3q5tKIKX1ctY")
            .then((res) => {
                console.log(res.data);
            });
    }

    sendToServer(name) {
        axios.post(process.env.REACT_APP_SERVER_URL + "retrieveStancesByLegislator", { name: name ? name : this.state.name })
            .then((res) => {
                this.setState({ sentiments: res.data });
                console.log(res.data);
            });
        this.setState({ names: [], senators: [], moved: true });
        this.setState({ displayName: name ? name : this.state.name });
        this.scrollToTop();
    }

    changeName(e) {
        this.setState({ name: e.target.value });
        this.setState({ dropDown1: e.target.value });
    }

    submitName(e) {
        e.preventDefault();
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
        this.scrollToBottem();
        // this.setState({ dummy: true });
    }

    pressedCategory(e, i) {
        e.preventDefault();
        let copy = [...this.state.render];
        copy[i] = true;
        console.log(copy);
        this.setState({ render: copy });
    }

    scrollToTop() {
        top.current?.scrollIntoView({ behavior: 'smooth' });
    }

    scrollToBottem() {
        end.current?.scrollIntoView({ behavior: 'smooth' });
    }

    lev_dist(a, b) {
        function min_dist(s1, s2) {
            if (s1 === a.length || s2 === b.length) {
                return a.length - s1 + b.length - s2;
            }
            if (a[s1] === b[s2]) {
                return min_dist(s1 + 1, s2 + 1);
            }
            return 1 + Math.min(
                min_dist(s1, s2 + 1),
                min_dist(s1 + 1, s2),
                min_dist(s1 + 1, s2 + 1),
            );
        }
        return min_dist(0, 0);
    }

    render() {
        let names = [];
        let senators = [];

        var i = 0;
        if (this.state.names.length != 0) {
            this.state.names.forEach((element) => {
                names.push(<button key={element} onClick={(e) => { e.preventDefault(); this.setState({ displayName: element }); this.sendToServer(element); }} className="bg-darkgray lg:w-1/4 p-2 lg:p-5 mx-auto rounded-2xl my-5 text-white lg:text-2xl font-semibold">{element + ((i < 2) ? " - State Senator" : " - National Representative")}</button>);
                i++;
            });
        }

        if (this.state.senators.length != 0) {
            this.state.senators.forEach((element) => {
                names.push(<button key={element} onClick={(e) => { e.preventDefault(); this.setState({ displayName: element }); this.sendToServer(element); }} className="bg-darkgray lg:w-1/4 p-2 lg:p-5 mx-auto rounded-2xl my-5 text-white lg:text-2xl font-semibold">{element + " - National Senator"}</button>);
            });
            // this.scroll();
        }

        // if (dummy) {
        // this.scroll();
        // dummy = false;
        // }

        let component1 = this.state.moved ? null : <Blurb />;
        let component2 = this.state.moved ? <Blurb /> : null;
        // let component1 = <Blurb />;
        // let component2 = null;

        let opened = [];
        for (let i = 0; i < this.state.render.length; i++) {
            const element = this.state.render[i];
            opened[i] = [];
            if (element) {
                // this.state.sentiments[i].bills.forEach((bill) => {
                // opened[i].push(<h2>{bill}</h2>);
                // });
            } else {
                opened[i] = null;
            }
        }

        // if (display) {
        // displayName = this.state.name;
        // }

        return (
            <div className="min-h-screen text-center bg-backgroundBlack text-white">
                <Title />
                <div ref={top} />
                {component1}
                <div>
                    <h1 className="font-poppins text-5xl" style={{ marginTop: "40px", textDecoration: "red wavy underline" }}>{this.state.displayName}</h1>
                    <div className="grid grid-cols-2">
                        <div className="grid grid-cols-1">
                            <button onClick={(e) => this.pressedCategory(e, 3)}>{
                                // this.state.sentiments[3].header
                                "Abortion - affirmative"
                            }</button>
                            <h2>Bill One</h2>
                            {/* {opened[3]} */}
                        </div>
                    </div>
                </div>
                <div className={"text-center text-lightblue lg:text-2xl font-semibold mt-10 mb-40"}>
                    <form>
                        <input ref={end} onChange={this.changeLocation} className="rounded-2xl text-center text-black lg:w-1/4 m-2 lg:m-10 h-12" placeholder="Home Address or Zip Code"></input>
                        <button onClick={this.submitLocation} className="bg-gray-700 h-12 px-2 lg:px-5 rounded-2xl">Get By Location</button>
                    </form>

                    {/* or */}

                    <form className="flex items-start justify-center">
                        <div className="lg:w-1/4 m-2 lg:m-10 h-fit inline-block">
                            <input onChange={this.changeName} className="rounded-2xl text-center text-black h-12" placeholder="Legislator Name"></input>
                            <div>{this.state.dropDown1}</div>
                            <div>{this.state.dropDown2}</div>
                            <div>{this.state.dropDown3}</div>
                        </div>
                        <button onClick={this.submitName} className="bg-gray-700 h-12 px-2 lg:px-5 rounded-2xl inline-block lg:m-10">Submit Name</button>
                    </form>

                    <div className="grid grid-cols-1">
                        {names}
                    </div>
                    <div className="grid grid-cols-1">
                        {senators}
                    </div>
                </div>
                {/* <div ref={end} /> */}
                <h1 className="h-1"></h1>
                {component2}
            </div>
        );
    }
}

export default Main;