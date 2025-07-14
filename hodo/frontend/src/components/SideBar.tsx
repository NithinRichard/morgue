import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";
// import { GraphIcon } from '@primer/octicons-react'
// import { PlusCircleIcon } from '@primer/octicons-react'
// import { ListUnorderedIcon } from '@primer/octicons-react'
// import { ReportIcon } from '@primer/octicons-react'
// import { ShieldCheckIcon } from '@primer/octicons-react'
// import { FileDirectoryIcon } from '@primer/octicons-react'
// import { LocationIcon } from '@primer/octicons-react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
// import logo from '../assets/logo.png';
import sidebarLogo from "../assets/sidebar-logo.jpg";
import '../styles/sidebar.css'

interface SideBarProps {
  collapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed = false }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-top">
          <a
            href=""
            className={`sidebar-profile ${collapsed ? "collapsed" : ""}`}
          >
            <img src={sidebarLogo} alt="" />
          </a>
          <div className="sidebar-text">
            <h6 className="sidebar-heading">System Admin</h6>
            <h4 className="sidebar-para">HODO Hospital,</h4>
            <p className="sidebar-para">Kazhakkottam</p>
            <p className="sidebar-para2">System Admin</p>
          </div>
        </div>
        <div className={`searchbar ${collapsed ? "collapsed" : ""}`}>
          <div className="sidebar-date">
            <h6 className="sidebar-date-heading">
              @Anchal {new Intl.DateTimeFormat('en-GB', {
                day:'2-digit',
                month:'2-digit',
                year:'numeric'
              }).format(new Date())}
            </h6>

          </div>
          <input
            type="text"
            className="searchbar"
            placeholder="Search Menu- Ctrl + M"
          />
        </div>
      </div>
      <nav>
        <ul>
          <li className="sidebar-title">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "sidebar-heading2 active" : "sidebar-heading2"
              }
              title="Mortuary Management"
            >
              Mortuary Management
            </NavLink>
          </li>
          <ul className="sidebar-sublist">
            <li>
              <NavLink
                to="/"
                style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Overview" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Overview"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/inward" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Inward" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Inward"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bodies" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Bodies" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Bodies"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/storage" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Storage" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Storage"}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/exit" style={{fontWeight:400,color:"#cccccc"}}
                className={({ isActive }) =>
                  isActive ? "nav-item active" : "nav-item"
                }
                title={collapsed ? "Exit" : ""}
              >
                <span>
                  <FontAwesomeIcon icon={faCaretRight} />
                </span>
                {!collapsed && "Exit"}
              </NavLink>
            </li>
          </ul>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
