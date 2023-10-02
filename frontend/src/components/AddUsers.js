import { useState, useEffect } from 'react';
import axios from "axios";
import './AddUsers.css';

function AddUsers(props) {

  const [userEmail, setUserEmail] = useState('')
  const [organization, setOrganization] = useState({})
  const [organizations, setOrganizations] = useState({})
  const [isLoading, setIsLoading] = useState(true)

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
      setOrganization(response.data.data[0].name)

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

  useEffect(() => {
    makeRequest()

  }, []);

  function addUser(event) {
      event.preventDefault()

      axios({
          method: "POST",
          url: "/add-users",
          headers: {
              Authorization: 'Bearer ' + props.token
          },
          data: {
              organization: organization,
              email: userEmail
          }
      })
      .then((response) => {
        const res = response.data
        props.setMessage(res.message)
          res.access_token && props.setToken(res.access_token)
      }).catch((error) => {
        if (error.response) {
          props.setMessage(error.response.data.message)
          console.log(error.response)
          console.log(error.response.status)
          console.log(error.response.headers)
        }
      })

      setUserEmail("")
  }

  return isLoading ? <span>Loading...</span> : (
    <div className='add-users-container'>
      <div className='users-form-container'>
        <form className="add-user-form">
          <label htmlFor="organizations">Choose an organization:</label>

          <select onChange={(e) => setOrganization(e.target.value)} value={organization} name="organizations" id="organizations" required>
            {organizations.map(org => (
              <option key={org.id} value={org.name}>{org.name}</option>
            )
            )}
          </select>
          <input onChange={(e) => setUserEmail(e.target.value)}
              type="text"
              text={userEmail}
              name="userEmail"
              placeholder="User's Email"
              value={userEmail || ""} required />
          <button onClick={addUser}>Submit</button>
        </form>
      </div>
    </div>
  )
}

export default AddUsers;