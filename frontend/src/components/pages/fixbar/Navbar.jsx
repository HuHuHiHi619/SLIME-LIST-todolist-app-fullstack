import {React , useState,useRef,useEffect} from "react";

import { Link } from "react-router-dom";

function Navbar() {
 
  return (
    <>
      <div id="nav-bar">
        <div>
          <h1 className="text-[50px] pl-16 pt-6 text-slate-400">Good morning</h1>
        </div>
        <Link to='/register'>
          <button>Register</button>
        </Link>
        <Link to='/login'>
          <button>login</button>
        </Link>
       
      </div>
      
    </>
  );
}

export default Navbar;
