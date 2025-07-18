import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

const searchableMenu = [
  { label: 'Overview', path: '/' },
  { label: 'Inward', path: '/inward' },
  { label: 'Bodies', path: '/bodies' },
  { label: 'Storage', path: '/storage' },
  { label: 'Exit', path: '/exit' },
  { label: 'Analytics', path: '/analytics' }, // Search-only
];

const SideBar: React.FC<SideBarProps> = ({ collapsed = false }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const filtered = search
    ? searchableMenu.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="searchbar"
              placeholder="Search Menu- Ctrl + M"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
            {search && (
              <ul
                className="search-results"
                style={{
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  marginTop: 4,
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  zIndex: 2000,
                  width: '100%',
                  maxHeight: 220,
                  overflowY: 'auto',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  padding: 0,
                  listStyle: 'none',
                }}
              >
                {filtered.length === 0 && <li style={{ padding: 12, color: '#888' }}>No results</li>}
                {filtered.map(item => (
                  <li
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSearch('');
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: 15,
                      color: '#1975d3',
                      background: '#fff',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={e => (e.currentTarget.style.background = '#fff')}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
