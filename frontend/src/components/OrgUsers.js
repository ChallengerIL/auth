import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import './OrgUsers.css';

function OrgUsers() {

    const location = useLocation()
    const users = location.state.users

    return users?.length ? (
        <ul className='user-list'>
            {users.map(user => (
                <li className='user-item' key={user.id} value={user.email}>{user.email}</li>
            )
            )}
        </ul>
    ) : <h1>No users here</h1>
}

export default OrgUsers;