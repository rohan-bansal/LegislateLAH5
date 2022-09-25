import React from "react";
import img from "./element5-digital-ls8Kc0P9hAA-unsplash.jpg";

class Title extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="font-bold mx-auto" style={{ backgroundImage: `url(${img})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%' }}>
                <div style={{background: "linear-gradient(to bottom, rgba(200, 162, 255, 0.9), rgba(179, 128, 255, 0.9))"}}>
                    <h1 style={{fontFamily: 'Poppins'}} className="text-indigo-900 text-4xl lg:text-8xl py-10 px-10">VoteReal</h1>
                    <h2 style={{fontFamily: 'Montserrat'}} className="text-indigo-700 text-2xl lg:text-6xl pt-10 pb-7 lg:pb-20">Your truth, your information. Not theirs.</h2>
                </div>
            </div>
        );
    }
}

export default Title;