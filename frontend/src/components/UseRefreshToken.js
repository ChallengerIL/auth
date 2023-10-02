import { useState } from 'react';

function useRefreshToken() {

    function getToken() {
        const userToken = localStorage.getItem('refresh_token');
        return userToken && userToken
    }

    const [refreshToken, setRefreshToken] = useState(getToken());

    function saveToken(userToken) {
        localStorage.setItem('refresh_token', userToken);
        setRefreshToken(userToken);
    };

    function removeRefreshToken() {
        localStorage.removeItem("refresh_token");
        setRefreshToken(null);
    }

    return {
        setRefreshToken: saveToken,
        refreshToken,
        removeRefreshToken
    }
}

export default useRefreshToken;