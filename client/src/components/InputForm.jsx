import React from "react";

class InputForm extends React.Component {
    constructor(props) {
        this.state = { name: null, topic: null, categories: ["taxes"] };
    }

    render() {
        return (
            <div>
                <h1>TEST!!</h1>
                <input placeholder="Legislator Name"></input>
            </div>
        );
    }
}