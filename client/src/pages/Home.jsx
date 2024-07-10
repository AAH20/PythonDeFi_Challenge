import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import useUser from '../hooks/useUser';

export default function Home() {
  const { user } = useAuth();
  const { data: userData, isLoading: userLoading, error: userError } = useUser();
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userLoading) {
      if (userData) {
        // Access balance directly from userData
        setBalance(userData.balance); 
      } else if (userError) {
        setError('Error fetching user data: ' + userError.message);
      }
    }
  }, [userData, userLoading, userError]);

  return (
    <div className='container mt-3'>
      <h2>
        <div className='row'>
          <div className="mb-12">
            {user?.email !== undefined ? ( 
              <div>
                {error ? (
                  <p>Error: {error}</p>
                ) : userData ? ( // Show all user data directly from userData
                  <div>
                    <p>Your Ethereum Balance: {userData.balance} ETH</p>
                    <p>ID: {userData.id}</p> 
                    <p>Email: {userData.email}</p>
                    <p>Username: {userData.username}</p>
                    <p>First Name: {userData.first_name}</p>
                    <p>Last Name: {userData.last_name}</p>
                    <p>Is Staff: {userData.is_staff ? 'Yes' : 'No'}</p>
                    <p>Ethereum Wallet Address: {userData.ethereum_wallet_address}</p>
                  </div>
                ) : (
                  <p>Loading balance...</p>
                )}
              </div>
            ) : (
              'Please login first'
            )}
          </div>
        </div>
      </h2>
    </div>
  );
}