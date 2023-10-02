import { Navigate } from "react-router-dom";

const Protected = ({ token, children }) => {
    if (token === null) {
        return <Navigate to="/signin" replace />;
    }
    return children;
};
export default Protected;