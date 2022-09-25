import React from "react";
import axios from "axios";
import Title from "./Title";
import Blurb from "./Blurb";

var lev = require("fast-levenshtein");

const senators = require("./senators");
const peopleData = require("../allpeople.json");
const gunPeopleData = require("../Gunspeople.json");
const gunBillsRef = require("../Gunsbillref.json");

const end = React.createRef();
const top = React.createRef();
// var dummy = false;
var displayName, display;

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            topic: null,
            location: null,
            coords: null,
            state: null,
            names: [],
            senators: [],
            moved: false,
            categories: [
                "Taxes",
                "Abortion Access",
                "Minimum Wage",
                "Gun Control",
                "LGBTQ+ Rights",
                "Mail in Ballots",
                "Cybersecurity",
                "Marijuana",
                "Affirmative Action",
                "Government Funded Health Insurance",
            ],
            sentiments: [],
            render: [],
            displayName: null,
            dropDown1: null,
            dropDown2: null,
            dropDown3: null,
            votes: null,
            info: null,
            links: null,
            dummy: true,
        };

        this.submitName = this.submitName.bind(this);
        this.changeName = this.changeName.bind(this);

        this.changeLocation = this.changeLocation.bind(this);
        this.submitLocation = this.submitLocation.bind(this);

        this.sendToServer = this.sendToServer.bind(this);

        document.getElementById("root").setAttribute("name", "CA");
    }

    //unused
    getSenators() {
        // axios.get(process.env.REACT_APP_CONGRESS_URL + "member" + process.env.REACT_APP_CONGRESS_CONFIG + process.env.REACT_APP_CONGRESS_TOKEN)
        axios
            .get(
                "https://api.congress.gov/v3/member?api_key=" +
                "2EOUCzGD2RjDH8oLxXcMffEEWRpT3q5tKIKX1ctY"
            )
            .then((res) => {
                console.log(res.data);
            });
    }

    sendToServer(name) {
        this.setState({ dummy: !this.state.dummy });
        let finalName = name ? name : this.state.name;
        this.setState({ names: [], senators: [], moved: true });
        this.setState({ displayName: finalName });
        this.scrollToTop();

        console.log(finalName + " send ran");

        let votes = gunPeopleData[finalName]["votes"];
        // console.log(votes);
        let info = gunPeopleData[finalName]["info"];
        this.setState({ votes: votes, info: info });
        document.getElementById("root").setAttribute("name", info[2]);

        let links = [];
        votes.forEach((element) => {
            links.push(element.link);
        });
        this.setState({ links: links });
        this.setState({ render: new Array(links.length).fill(false) });
        // axios.post(process.env.REACT_APP_SERVER_URL + "retrieveStancesByLegislator", { links: links })
        // .then((res) => {
        // this.setState({ sentiments: res.data });
        // console.log(res.data);
        // });
    }

    changeName(e) {
        this.setState({ name: e.target.value });
        // this.setState({ dropDown1: e.target.value });
        let best = [
            ["", Number.MAX_SAFE_INTEGER],
            ["", Number.MAX_SAFE_INTEGER],
            ["", Number.MAX_SAFE_INTEGER],
        ];
        // console.log(best);
        peopleData.forEach((element) => {
            let dist = lev.get(element, e.target.value);
            // console.log(dist)
            if (dist < best[2][1]) {
                best[2][0] = element;
                best[2][1] = dist;
            }
            best.sort(function (a, b) {
                return a[1] - b[1];
            });
        });
        // console.log(best);
        this.setState({
            dropDown1: best[0][0],
            dropDown2: best[1][0],
            dropDown3: best[2][0],
        });
    }

    submitName(e) {
        e.preventDefault();
        this.sendToServer(this.state.dropDown1);
    }

    changeLocation(e) {
        this.setState({ location: e.target.value });
    }

    submitLocation(e) {
        e.preventDefault();
        axios
            .get(
                process.env.REACT_APP_MAPBOX_URL +
                this.state.location +
                process.env.REACT_APP_MAPBOX_FORWARD_CONFIG +
                process.env.REACT_APP_MAPBOX_TOKEN
            )
            .then((res) => {
                let coords = res.data.features[0].center;
                this.setState({ coords: coords });
                axios
                    .get(
                        process.env.REACT_APP_OPENSTATES_URL +
                        "lat=" +
                        coords[1] +
                        "&lng=" +
                        coords[0] +
                        process.env.REACT_APP_OPENSTATES_CONFIG +
                        process.env.REACT_APP_OPENSTATES_TOKEN
                    )
                    .then((res) => {
                        let results = res.data.results;
                        let array = [];
                        results.forEach((element) => {
                            // names.push(element.name);
                            // console.log(element.name);
                            array.push(element.name);
                            // this.setState({ names: this.state.names.concat([element.name]) });
                        });
                        this.setState({ names: array });
                        axios
                            .get(
                                process.env.REACT_APP_MAPBOX_URL +
                                coords[0] +
                                "," +
                                coords[1] +
                                process.env.REACT_APP_MAPBOX_BACKWARD_CONFIG +
                                process.env.REACT_APP_MAPBOX_TOKEN
                            )
                            .then((res) => {
                                let stateCode =
                                    res.data.features[0].context[4].short_code.substr(3, 2);
                                this.setState({ state: res.data.features[0].context[4].text });
                                let array = [];
                                senators.forEach((element) => {
                                    if (
                                        element.terms[0].type == "sen" &&
                                        element.terms[0].state == stateCode
                                    ) {
                                        array.push(element.name.official_full);
                                    }
                                    this.setState({ senators: array });
                                });
                            });
                    });
            });
        // console.log(this.state.names);
        // console.log(this.state.senators);
        // this.scrollToBottem();
        this.setState({ links: null, displayName: null});
    }

    pressedCategory(e, i) {
        e.preventDefault();
        let copy = [...this.state.render];
        copy[i] = !copy[i];
        // console.log(copy);
        this.setState({ render: copy });
    }

    scrollToTop() {
        top.current?.scrollIntoView({ behavior: "smooth" });
    }

    scrollToBottem() {
        end.current?.scrollIntoView({ behavior: "smooth" });
    }

    lev_dist(a, b) {
        function min_dist(s1, s2) {
            if (s1 === a.length || s2 === b.length) {
                return a.length - s1 + b.length - s2;
            }
            if (a[s1] === b[s2]) {
                return min_dist(s1 + 1, s2 + 1);
            }
            return (
                1 +
                Math.min(
                    min_dist(s1, s2 + 1),
                    min_dist(s1 + 1, s2),
                    min_dist(s1 + 1, s2 + 1)
                )
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
                names.push(
                    <button
                        key={element + "name"}
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({ displayName: element });
                            this.sendToServer(element);
                        }}
                        className="bg-darkgray lg:w-1/4 p-2 lg:p-5 mx-auto rounded-2xl my-5 text-white lg:text-2xl font-semibold"
                    >
                        {
                            <span className="font-poppins font-bold text-white text-4xl">
                                {element}
                            </span>
                        }{" "}
                        <br></br> {i < 2 ? "State Senator" : "National Representative"}
                    </button>
                );
                i++;
            });
        }

        if (this.state.senators.length != 0) {
            this.state.senators.forEach((element) => {
                names.push(
                    <button
                        key={element + "sen"}
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({ displayName: element });
                            this.sendToServer(element);
                        }}
                        className="bg-darkgray lg:w-1/4 p-2 lg:p-5 mx-auto rounded-2xl my-5 text-white lg:text-2xl font-semibold"
                    >
                        {
                            <span className="font-poppins font-bold text-white text-4xl">
                                {element}
                            </span>
                        }{" "}
                        <br></br> {"National Senator"}
                    </button>
                );
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

        let billsData = [];
        let components = [];
        let score = 0;
        // for (let i = 0; i < this.state.render.length; i++) {
        //     let render = this.state.render[i];
        //     opened[i] = [];
        //     if (render) {
        //         // gunBillsRef[].forEach((bill) => {
        //             this.state.links.forEach((link) => {
        //                 opened[i].push(<p>{this.state.votes[link].vote + '-' + gunBillsRef[link].name + '\n' + bill.synopsis}</p>);
        //                 if ()
        //             })
        //         // });
        //     } else {
        //         opened[i] = null;
        //     }
        // }
        if (this.state.links) {
            console.log(this.state.links);
            for (let i = 0; i < this.state.links.length; i++) {
                // this.state.links.forEach((link) => {
                let link = this.state.links[i];
                let vote = this.state.votes.find(
                    (element) => element.link == link
                ).vote;
                billsData.push({
                    index: i,
                    header: vote + " - " + gunBillsRef[link].name,
                    synopsis: gunBillsRef[link].synopsis,
                    pred: gunBillsRef[link].pred,
                });

                let pos = billsData[i].pred === "Positive";
                if (pos) {
                    if (vote === "Yes") score++;
                    else if (vote === "No") score--;
                } else {
                    if (vote === "Yes") score--;
                    else if (vote === "No") score++;
                }
                // });
            }
            billsData.forEach((bill) => {
                components.push(
                    <button
                        key={"button" + bill.index}
                        className="text-4xl text-bold mt-10"
                        style={{ padding: "20px", background: "#292929" }}
                        onClick={(e) => this.pressedCategory(e, bill.index)}
                    >
                        {bill.header.split(" - ")[0] === "Yes" ? (
                            <span className="font-poppins font-bold text-green-500">Yes</span>
                        ) : (
                            <span className="font-poppins font-bold text-red-500">No</span>
                        )}{" "}
                        <br></br>
                        <span className="font-poppins font-medium">
                            {bill.header.split(" - ")[2]}{" "}
                        </span>
                        <br></br>
                        {bill.header.split(" - ")[1]} ({bill.header.split(" - ")[3]})
                    </button>
                );
                components.push(
                    this.state.render[bill.index] ? (
                        <h2
                            key={"synopsis" + bill.index}
                            className="text-2xl"
                            style={{
                                padding: "10px",
                                width: "fit-content",
                                margin: "0 auto",
                                background: "#292929",
                                borderRadius: "20px",
                                marginTop: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            {bill.synopsis}
                        </h2>
                    ) : <div />
                );
                components.push(
                    this.state.render[bill.index] ? (
                        <h2 key={"pred" + bill.index}>
                            {bill.pred === "Positive" ? (
                                <span className="font-poppins font-bold text-red-200">
                                    Does Not Support
                                </span>
                            ) : (
                                <span className="font-poppins font-bold text-green-200">
                                    Supports
                                </span>
                            )}
                        </h2>
                    ) : <div />
                );
            });
        }

        // if (display) {
        // displayName = this.state.name;
        // }

        console.log(this.state.displayName);
        console.log(components);

        return (
            <div className="min-h-screen text-center bg-backgroundBlack text-white">
                <Title />
                <div ref={top} />
                {component1}
                <div className="text-lightblue">
                    <h1
                        className="font-poppins text-5xl"
                        style={{ marginTop: "40px", textDecoration: "red wavy underline" }}
                    >
                        {this.state.displayName}
                    </h1>
                    {/* <div className="grid grid-cols-2"> */}
                    <div className="grid grid-cols-1">
                        {/* <button className="text-4xl text-bold mt-10" onClick={(e) => this.pressedCategory(e, )}>{
                            "Gun rights position" + ' - ' + this.state.sentiments.prediction
                            // "Abortion - affirmative"
                        }</button>
                        {opened[3]} */}

                        {this.state.links ? (
                            <h1 className="text-4xl text-bold mt-10 font-bold">
                                Gun Control Stance:{" "}
                                {score > 0 ? (
                                    <span className="font-poppins font-bold text-red-200">
                                        Opposing
                                    </span>
                                ) : score < 0 ? (
                                    <span className="font-poppins font-bold text-green-200">
                                        Supporting
                                    </span>
                                ) : (
                                    <span className="font-poppins font-bold text-white">
                                        Neutral
                                    </span>
                                )}
                            </h1>
                        ) : null}
                        {components ? components : null}
                    </div>
                    {/* </div> */}
                </div>
                <div
                    className={
                        "text-center text-lightblue lg:text-2xl font-semibold mt-10 mb-20"
                    }
                >
                    <iframe
                        className="h-400 w-960 mx-auto mb-20 rounded-2xl"
                        src="./map.html"
                        frameBorder="0"
                        width={960}
                        height={400}
                        scrolling="no"
                    />

                    <div className="grid grid-cols-1">{names}</div>
                    <div className="grid grid-cols-1">{senators}</div>
                    <form>
                        <input
                            onChange={this.changeLocation}
                            className="rounded-2xl text-center text-black lg:w-1/4 m-2 lg:m-10 h-12"
                            placeholder="Home Address or Zip Code"
                        ></input>
                        <button
                            onClick={this.submitLocation}
                            className="bg-gray-700 h-12 px-2 lg:px-5 rounded-2xl"
                        >
                            Get By Location
                        </button>
                    </form>

                    {/* or */}

                    <form className="flex items-start justify-center">
                        <div className="lg:w-1/4 m-2 lg:m-10 h-fit inline-block">
                            <input
                                ref={end}
                                onChange={this.changeName}
                                className="rounded-2xl text-center text-black h-12"
                                placeholder="Legislator Name"
                            ></input>
                            <div className="my-5">
                                <button
                                    className="w-max"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({ displayName: this.state.dropDown1 });
                                        this.sendToServer(this.state.dropDown1);
                                    }}
                                >
                                    {this.state.dropDown1}
                                </button>
                            </div>
                            <div className="my-5">
                                <button
                                    className="w-max"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({ displayName: this.state.dropDown2 });
                                        this.sendToServer(this.state.dropDown2);
                                    }}
                                >
                                    {this.state.dropDown2}
                                </button>
                            </div>
                            <div className="my-5">
                                <button
                                    className="w-max"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({ displayName: this.state.dropDown3 });
                                        this.sendToServer(this.state.dropDown3);
                                    }}
                                >
                                    {this.state.dropDown3}
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={this.submitName}
                            className="bg-gray-700 h-12 px-2 lg:px-5 rounded-2xl inline-block lg:m-10"
                        >
                            Submit Name
                        </button>
                    </form>
                </div>
                {/* <div ref={end} /> */}
                <h1 className="h-1"></h1>
                {component2}
            </div>
        );
    }
}

export default Main;
