import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import useAuth from '../../hooks/useAuth';
import useLogout from "../../hooks/useLogout";
import useUser from '../../hooks/useUser';

export default function User() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();
  const [loading, setLoading] = useState(false);
  const { data: userData, isLoading: userLoading, error: userError } = useUser();

  useEffect(() => {
    // No need to call getUser() manually here, as useUser() will fetch the data 
  }, []);

  async function onLogout() {
    setLoading(true);
    await logout();
    navigate('/');
  }

  return (
    <div className='container mt-3'>
      {userLoading ? ( 
        <p>Loading user data...</p>
      ) : userError ? ( 
        <p>Error: {userError.message}</p> 
      ) : userData ? ( 
        <>
          <h4>ID: {userData.id}</h4>
          <h4>Username: {userData.username}</h4>
          <h4>Email: {userData.email}</h4>
          <h4>First Name: {userData.first_name}</h4>
          <h4>Last Name: {userData.last_name}</h4>
          <h4>Is Staff: {userData.is_staff ? 'Yes' : 'No'}</h4>
          <h4>Ethereum Wallet Address: {userData.ethereum_wallet_address}</h4>
          <h4>Balance: {userData.balance} ETH</h4> 
        </>
      ) : (
        <p>Error: User data not found.</p> 
      )}
      <button disabled={loading} type='button' onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}