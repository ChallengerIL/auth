import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import CreateOrg from './components/CreateOrg';
import UseToken from './components/UseToken';
import useRefreshToken from "./components/UseRefreshToken";
import AddUsers from './components/AddUsers';
import Protected from "./components/Protected";
import HandleNotFound from "./components/HandleNotFound";
import OrgUsers from "./components/OrgUsers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import './App.css';
import MyOrganizations from "./components/MyOrganizations";

function App() {

  const { refreshToken, removeRefreshToken, setRefreshToken } = useRefreshToken();
  const { token, removeToken, setToken } = UseToken();
  const [ message, setMessage ] = useState();
 
  const notify = () => toast(message);

  useEffect(() => {
    notify();
    setMessage();
  }, [message]);

  const loggedOutNav = () => {
    return (
      <>
        <li className="nav-item">
          <NavLink className="nav-link" to="/signin">Sign In</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/signup">Sign Up</NavLink>
        </li>
      </>
    )
  }

  function signOut() {
    axios({
      method: "POST",
      url: "/signout",
      headers: {
        Authorization: 'Bearer ' + token
      },
    })
    .then((response) => {
      removeToken()
      setMessage(response.data.message)
    }).catch((error) => {
      axios({
        method: "POST",
        url: "/refresh",
        headers: {
          Authorization: 'Bearer ' + refreshToken
        },
      })

      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  const loggedInNav = () => {
    return (
      <>
        <li className="nav-item">
          <NavLink className="nav-link" to="/create-org">Create Organization</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/add-users">Add Users</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/my-organizations" >My Organizations</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/signin" onClick={signOut}>Sign Out</NavLink>
        </li>
      </>
    )
  }

  let navItems;

  if (token) {
    navItems = loggedInNav();
  } else {
    navItems = loggedOutNav();
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <ul className="nav-list">
          {navItems}
        </ul>
      </nav>
      <main>
        <Routes>
          <Route path="/signin" element={<SignIn token={token} setToken={setToken} setRefreshToken={setRefreshToken} />} />
          <Route path="/signup" element={<SignUp setMessage={setMessage} />} />
          <Route path="/create-org" element={
            <Protected token={token}>
              <CreateOrg setToken={setToken} token={token} setMessage={setMessage} refreshToken={refreshToken} />
            </Protected>
          } />
          <Route path="/add-users" element={
            <Protected token={token}>
              <AddUsers setToken={setToken} token={token} setMessage={setMessage} refreshToken={refreshToken} />
            </Protected>
          } />
          <Route path="/my-organizations" element={
            <Protected token={token}>
              <MyOrganizations token={token} setMessage={setMessage} refreshToken={refreshToken} setToken={setToken} />
            </Protected>
          } />
          <Route path="/organization-users" element={
            <Protected token={token}>
              <OrgUsers />
            </Protected>
          } />
          <Route path="*" element={<HandleNotFound token={token} />} />
        </Routes>
      </main>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;