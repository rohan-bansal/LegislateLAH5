import React from "react";
import img from "./element5-digital-ls8Kc0P9hAA-unsplash.jpg";

class Title extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="font-bold mx-auto" style={{ backgroundImage: `url(${img})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%' }}>
                <div style={{background: "linear-gradient(to bottom,#E3D9FECC,#E3D9FECC)"}}>
                    <h1 style={{fontFamily: 'Poppins'}} className="text-indigo-700 text-4xl lg:text-8xl py-10 px-10"><span style={{color: "white"}}>vote</span><span style={{color: "#FF3F3F"}}>real</span>.</h1>
                    <h2 style={{fontFamily: 'Montserrat'}} className="text-indigo-700 text-2xl lg:text-6xl pt-10 pb-7 lg:pb-20"><span style={{color: "white", textDecoration: "#FF3F3F"}}>Your</span> truth. <span style={{color: "white", textDecoration: "#FF3F3F"}}>Your</span> information.</h2>
                    <h2 style={{fontFamily: 'Montserrat'}} className="text-indigo-700 lg:text-6xl lg:pb-20">Not theirs.</h2>
                </div>
            </div>
        );
    }
}

export default Title;