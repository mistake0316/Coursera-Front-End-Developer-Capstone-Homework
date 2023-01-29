import React from "react";
import "./Header.css"
const Header = (props:any)=>{
  const currentPage = props.page;

  return <nav id="header">
    {
      ["Home", "Booking Table", "About", "Contact"].map(
        name=>
        <span
          className={currentPage==name ? "highlight" : ""}
        >
        {name} 
        </span>
      )
    }
  </nav>
}


export default Header;