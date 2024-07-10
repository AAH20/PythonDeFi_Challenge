import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../api/apiConfig';

const INFURA_API_KEY = 'dd271ba0e16340748ef955b53b3f613d'; // Replace with your actual Infura API key

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ethAddressError, setEthAddressError] = useState(null);

  const formRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    password: useRef(null),
    password2: useRef(null),
    ethereumWalletAddress: useRef(null),
  };

  async function isValidEthereumAddress(address) {
    // Basic checksum validation (not as robust as using a library)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async function getWalletBalance(address) {
    try {
      const response = await fetch('https://mainnet.infura.io/v3/' + INFURA_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'], 
          id: 1,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Infura API Error:', data.error);
        return { error: 'Error fetching balance' };
      }

      const balanceWei = data.result;
      const balanceEther = parseInt(balanceWei, 16) / 10**18; 
      return { balance: balanceEther };

    } catch (error) {
      console.error('Error fetching balance:', error);
      return { error: 'Error fetching balance' };
    }
  }

  async function onSubmitForm(event) {
    event.preventDefault();

    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      password2, 
      ethereumWalletAddress 
    } = formRefs;

    const address = ethereumWalletAddress.current.value;

    if (!isValidEthereumAddress(address)) {
      setEthAddressError('Please enter a valid Ethereum address.');
      return;
    }

    setEthAddressError(null);

    // Example: Fetch and log the balance 
    const balanceResult = await getWalletBalance(address);
    if (balanceResult.error) {
      console.error(balanceResult.error);
    } else {
      console.log('Balance:', balanceResult.balance, 'ETH');
    }

    const data = {
      first_name: first_name.current.value,
      last_name: last_name.current.value,
      email: email.current.value,
      password: password.current.value,
      password2: password2.current.value,
      ethereum_wallet_address: address,
    };

    setLoading(true);

    try {
      await axiosInstance.post('auth/register', JSON.stringify(data));

      setLoading(false);
      navigate('/auth/login');

    } catch (error) {
      setLoading(false);
      // TODO: Implement robust error handling 
    }
  }

  return (
    <div className='container'>
      <h2>Register</h2>
      <form onSubmit={onSubmitForm}>
        <div className="mb-3">
          <input type="text" 
                 placeholder='First Name' 
                 autoComplete='off' 
                 className='form-control' 
                 id='first_name' 
                 ref={formRefs.first_name} 
          />
        </div>
        <div className="mb-3">
          <input type="text" 
                 placeholder='Last Name' 
                 autoComplete='off' 
                 className='form-control' 
                 id='last_name' 
                 ref={formRefs.last_name} 
          />
        </div>
        <div className="mb-3">
          <input type="email" 
                 placeholder='Email' 
                 autoComplete='off' 
                 className='form-control' 
                 id="email" 
                 ref={formRefs.email} 
          />
        </div>
        <div className="mb-3">
          <input type="password" 
                 placeholder='Password' 
                 autoComplete='off' 
                 className='form-control' 
                 id="password" 
                 ref={formRefs.password} 
          />
        </div>
        <div className="mb-3">
          <input type="password" 
                 placeholder='Confirm Password' 
                 autoComplete='off' 
                 className='form-control' 
                 id="passwordConfirmation" 
                 ref={formRefs.password2} 
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Ethereum Wallet Address"
            autoComplete="off"
            className={`form-control ${ethAddressError ? 'is-invalid' : ''}`}
            id="ethereumWalletAddress"
            ref={formRefs.ethereumWalletAddress}
          />
          {ethAddressError && (
            <div className="invalid-feedback">{ethAddressError}</div>
          )}
        </div>
        <div className="mb-3">
          <button disabled={loading} className="btn btn-success" type="submit">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}