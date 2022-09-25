import React from "react";

class Blurb extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="text-center mx-auto mt-10 lg:w-2/3 px-10 lg:px-20 py-10 rounded-2xl">
                <h1 className="mx-auto w-fit text-2xl lg:text-5xl pb-10 text-lightblue font-bold">What Does Your Legislator Truly Think?</h1>
                <p className="text-base lg:text-2xl text-left indent-12">
                    What legislators say on Twitter or in rallies often doesn't align with their true political views.
                    Legislators have motivation to present themselves in ways that lead to their re-election.
                    However, informed citizens should know the true sentiments of their representatives.
                    Thus, it's important to analyze how lawmakers actually voted on bills to give you the most accurate information.
                    Look up your legislator below and see what they truly think and how they truly represent you.
                    Now go forth and stay informed!
                </p>
            </div>
        );
    }
}

export default Blurb