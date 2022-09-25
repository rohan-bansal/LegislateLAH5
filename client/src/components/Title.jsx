import React from "react";
import img from "./element5-digital-ls8Kc0P9hAA-unsplash.jpg";

class Title extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="font-bold mx-auto" style={{ backgroundImage: `url(${img})`, backgroundRepeat: 'no-repeat', backgroundSize: '100%' }}>
                <div style={{background: "linear-gradient(to bottom,#FFCECECC,#FFCECECC)"}}>
                    <h1 style={{fontFamily: 'Poppins'}} className="text-indigo-700 text-6xl lg:text-9xl py-10 px-10 pt-32"><span style={{color: "white"}}>vote</span><span style={{color: "#FF3F3F"}}>real</span>.</h1>
                    <h2 style={{fontFamily: 'Montserrat'}} className="text-indigo-700 text-2xl lg:text-6xl pt-10 lg:pb-5"><span style={{color: "white", textDecoration: "#FF3F3F"}}>Your</span> truth. <span style={{color: "white", textDecoration: "#FF3F3F"}}>Your</span> information.</h2>
                    <h2 style={{fontFamily: 'Montserrat'}} className="text-indigo-700 lg:text-6xl lg:pb-20"><span style={{color: "white", textDecoration: "#FF3F3F underline", textUnderlineOffset: "5px"}}>Not</span> theirs.</h2>
                </div>
            </div>
        );
    }
}

export default Title;