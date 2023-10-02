import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './MyOrganizations.css';

function MyOrganizations(props) {

    const navigate = useNavigate()

    const [organizations, setOrganizations] = useState()
    const [isLoading, setIsLoading] = useState(true)

    const getUsers = async (orgName) => {
        try {
            const response = await axios({
                method: "GET",
                url: `/org-users/${orgName}`,
                headers: {
                    Authorization: 'Bearer ' + props.token
                }
            });

            navigate("/organization-users", {
                state: {
                    users: response.data.data
                }
            }
            )
            
        } catch (error) {
            const response = await axios({
                method: "POST",
                url: "/refresh",
                headers: {
                    Authorization: 'Bearer ' + props.refreshToken
                }
            });
            props.setToken(response.data.access_token)
        }
    };

    useEffect(() => {
        const makeRequest = async () => {
        try {
            setIsLoading(true)
            const response = await axios({
                method: "GET",
                url: "/my-organizations",
                headers: {
                    Authorization: 'Bearer ' + props.token
                }
            });

            setOrganizations(response.data.data)

            setIsLoading(false)
        } catch (error) {
            const response = await axios({
                method: "POST",
                url: "/refresh",
                headers: {
                    Authorization: 'Bearer ' + props.refreshToken
                }
            });
            props.setToken(response.data.access_token)
        }
    };

        makeRequest()
    }, []);

    return isLoading ? <span>Loading...</span> : (
        <ul className='org-list'>
            {organizations.map(org => (
                <li className='org-item' onClick={() => getUsers(org.name)} key={org.id}>{org.name}</li>
            )
            )}
        </ul>
    )
}

export default MyOrganizations;