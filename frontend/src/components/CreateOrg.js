import { useState } from 'react'
import axios from "axios";

function CreateOrg(props) {

    const [orgName, setOrgName] = useState("")

    const createOrg = async (event) => {
        event.preventDefault()

        try {
            const response = await axios({
                method: "POST",
                url: `/create-org`,
                headers: {
                    Authorization: 'Bearer ' + props.token
                },
                data: {
                    name: orgName
                }
            });

            const res = response.data
            props.setMessage(res.message)
            res.access_token && props.setToken(res.access_token)

            setOrgName("")

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

    return (
        <div>
            <h1>Create Organization</h1>
            <form className="create-org">
                <input onChange={e => setOrgName(e.target.value)}
                    type="text"
                    text={orgName}
                    name="orgName"
                    placeholder="Organization's name"
                    value={orgName || ""} />
                <button onClick={createOrg}>Submit</button>
            </form>
        </div>
    );
}

export default CreateOrg;