import { Navigate } from "react-router-dom";

function HandleNotFound(props) {
    return props.token ? <Navigate to='/create-org' replace /> : <Navigate to='/signin'  replace />;
}

export default HandleNotFound;