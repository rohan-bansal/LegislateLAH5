import React from "react";

class Blurb extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{borderRadius: "50px", padding: "10px"}}>
                <div className="text-center mx-auto lg:w-2/3 px-10 lg:px-20 py-10 rounded-2xl">
                    <h1 className="mx-auto w-fit text-2xl lg:text-5xl pb-10 pt-6 font-bold" style={{color: "#ADEFFF"}}>What Does Your Legislator Truly Think?</h1>
                    <p className="text-base text-center lg:text-2xl text-left indent-12 leading-10">
                        What legislators say on Twitter or in rallies often <span style={{textDecoration: "#ADEAFF underline", textUnderlineOffset: "3.5px"}}>doesn't align</span> with their true political views.
                        Legislators have motivation to present themselves in ways that lead to their re-election.
                        However, informed citizens should know the true sentiments of their representatives.
                        Thus, it's important to analyze <span style={{textDecoration: "#ADEAFF underline", textUnderlineOffset: "3px"}}>how</span> lawmakers actually voted on bills to give you the most accurate information.
                        Look up your legislator below and see what they truly think and how they truly represent you.
                        Now go forth and <span style={{textDecoration: "#ADEAFF underline", textUnderlineOffset: "3px"}}>stay informed</span>!
                    </p>
                </div>
            </div>
           
        );
    }
}

export default Blurb