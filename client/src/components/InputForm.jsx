import React from "react";

class InputForm extends React.Component {
    constructor(props) {
        super((props));
        this.state = { name: null, topic: null, categories: ["Taxes", "Abortion Access", "Minimum Wage", "Guns", "LGBTQ+ Rights", "Mail in Ballots", "Cybersecurity", "Marijuana", "Affirmative Action", "Government Funded Health Insurance"] };
    }

    render() {
        return (
            <div className="min-h-screen text-center bg-black">
                <div className="text-center bg-green-400 mx-auto">
                    <h1 className="mx-auto w-fit text-white">What Does Your Legislator Truly Think?</h1>
                </div>
                <input placeholder="Legislator Name"></input>
            </div>
        );
    }
}

export default InputForm;