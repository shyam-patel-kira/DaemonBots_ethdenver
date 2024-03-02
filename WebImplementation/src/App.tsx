// import {
//   conditions,
//   decrypt,
//   domains,
//   encrypt,
//   getPorterUri,
//   initialize,
//   ThresholdMessageKit,
// } from '@nucypher/taco';
// import { Mumbai, useEthers } from '@usedapp/core';
// import { ethers } from 'ethers';
// import React, { useEffect, useState } from 'react';
// import { create } from 'ipfs-http-client';
// import { Decrypt } from './Decrypt';
// import { Encrypt } from './Encrypt';
// import { NFTConditionBuilder } from './NFTConditionBuilder';
// import { Spinner } from './Spinner';
// import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config';

// export default function App() {
//   const provider = new ethers.providers.Web3Provider(window.ethereum);
//   // Smart Contract ABI and Address
// const contractABI = require('./path_to_your_ABI.json');
// const contractAddress = 'YOUR_CONTRACT_ADDRESS';

// // Initialize the contract
// const contract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());
//   // Initialize IPFS
// const ipfs = create({ url: 'https://ipfs.infura.io:5001' }); // Use your IPFS node URL

//   const { activateBrowserWallet, deactivate, account, switchNetwork } =
//     useEthers();
//     const uploadToIPFS = async (encryptedMsg: ThresholdMessageKit) => {
//       try {
//         setLoading(true);
//         const serializedMessage = JSON.stringify(encryptedMsg);
//         const added = await ipfs.add(serializedMessage);
//         const url = `https://ipfs.infura.io/ipfs/${added.path}`;
//         console.log(`Uploaded to IPFS: ${url}`);
//         await contract.uploadUri(url);
//         console.log(`URI stored in contract: ${url}`);

//         // Here you can set the IPFS URL to the state or handle it as needed
//         setLoading(false);
//       } catch (error) {
//         console.error('Error uploading file: ', error);
//         setLoading(false);
//       }
//     };
    
//   const [loading, setLoading] = useState(false);
//   const [condition, setCondition] = useState<conditions.condition.Condition>();
//   const [encryptedMessage, setEncryptedMessage] =
//     useState<ThresholdMessageKit>();
//   const [decryptedMessage, setDecryptedMessage] = useState<string>();
//   const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);
//   const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
//   const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

//   useEffect(() => {
//     initialize();
//   }, []);

//   const encryptMessage = async (message: string) => {
//     if (!condition) {
//       return;
//     }
//     setLoading(true);

//     await switchNetwork(Mumbai.chainId);



//     const encryptedMessage = await encrypt(
//       provider,
//       domain,
//       message,
//       condition,
//       ritualId,
//       provider.getSigner(),
//     );

//     setEncryptedMessage(encryptedMessage);
//     uploadToIPFS(encryptedMessage);
//     setLoading(false);
//   };

//   const decryptMessage = async (encryptedMessage: ThresholdMessageKit) => {
//     if (!condition) {
//       return;
//     }
//     setLoading(true);
//     setDecryptedMessage('');
//     setDecryptionErrors([]);

//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const decryptedMessage = await decrypt(
//       provider,
//       domain,
//       encryptedMessage,
//       getPorterUri(domain),
//       provider.getSigner(),
//     );

//     setDecryptedMessage(new TextDecoder().decode(decryptedMessage));
//     setLoading(false);
//   };

//   if (!account) {
//     return (
//       <div>
//         <h2>Web3 Provider</h2>
//         <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
//       </div>
//     );
//   }

//   if (loading) {
//     return <Spinner loading={loading} />;
//   }

//   return (
//     <div>
//       <div>
//         <h2>Web3 Provider</h2>
//         <button onClick={deactivate}> Disconnect Wallet</button>
//         {account && <p>Account: {account}</p>}
//       </div>

//       <h2>Notice</h2>
//       <p>
//         In order to access this demo, make sure to allow-list your wallet
//         address first.
//       </p>
//       <p>
//         Connect with us on our{' '}
//         <a href={'https://discord.gg/threshold'}>Discord server</a> at{' '}
//         <b>#taco</b> channel to get your wallet address allow-listed
//       </p>

//       <h2>Ritual ID</h2>
//       <p>Replace with your own ritual ID</p>
//       <input
//         type={'number'}
//         value={ritualId}
//         onChange={(e) => setRitualId(parseInt(e.currentTarget.value))}
//       />

//       <h2>TACo Domain</h2>
//       <p>Must match the domain of your ritual</p>
//       <select
//         defaultValue={domain}
//         onChange={(e) => setDomain(e.currentTarget.value)}
//       >
//         {Object.values(domains).map((domain) => (
//           <option value={domain} key={domain}>
//             {domain}
//           </option>
//         ))}
//       </select>

//       <NFTConditionBuilder
//         enabled={true}
//         condition={condition}
//         setConditions={setCondition}
//       />

//       <Encrypt
//         enabled={!!condition}
//         encrypt={encryptMessage}
//         encryptedMessage={encryptedMessage!}
//       />

//       <Decrypt
//         enabled={!!encryptedMessage}
//         decrypt={decryptMessage}
//         decryptedMessage={decryptedMessage}
//         decryptionErrors={decryptionErrors}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Mumbai, useEthers } from '@usedapp/core';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { NFTConditionBuilder } from './NFTConditionBuilder';
import { Spinner } from './Spinner'; // Ensure you have a Spinner component for loading indication
import {
  conditions,
  encrypt,
  initialize,
  ThresholdMessageKit,
} from '@nucypher/taco';
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config'; // Ensure these are correctly set up

const ipfs = create({ url: 'https://ipfs.infura.io:5001' }); // Initialize IPFS

export default function App() {
const contractABI = require('./path_to_your_ABI.json');
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const dataContract = new ethers.Contract(contractAddress, contractABI, provider.getSigner());
  const { activateBrowserWallet, account, switchNetwork } = useEthers();
  const [loading, setLoading] = useState(false);
 const [condition, setCondition] = useState<conditions.condition.Condition>();// Assuming a simple condition setup for demo
  const [fileContent, setFileContent] = useState("");
  const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

  useEffect(() => {
    initialize();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text === "string") { // Ensure text is a string
                setFileContent(text);
            }
        };
        reader.readAsText(file);
    }
};


  const uploadToIPFS = async (encryptedData: string) => {
    try {
      const added = await ipfs.add(encryptedData);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log(`Uploaded to IPFS: ${url}`);
      return url;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      return "";
    }
  };

  const encryptAndUpload = async () => {
    if (!fileContent || !account) return;
    setLoading(true);

    // Ensure the network is switched to Mumbai (or your target network)
    await switchNetwork(Mumbai.chainId);

    // Initialize the provider with signer
  
    const signer = provider.getSigner();
    if (!condition) {
      console.error("Condition is undefined.");
      return;
  }
    // Encrypt the file content
    try {
        const encryptedData = await encrypt(
          provider,
          domain,
          fileContent, // Previously was 'message', now using the uploaded file's content
          condition,
          ritualId,
          signer // Passing signer for encryption
        );

        // Serialize the encrypted data if necessary
        const serializedEncryptedData = JSON.stringify(encryptedData);

        // Upload encrypted data to IPFS
        const ipfsUrl = await uploadToIPFS(serializedEncryptedData);
        if (ipfsUrl) {
          // Mint an NFT for the user with the IPFS URL as the token URI
          try {
              const transaction = await dataContract.mintNFT(account, ipfsUrl);
              const tx = await transaction.wait();
              const event = tx.events[0];
              const value = event.args[2];
              const tokenId = value.toNumber();
              console.log(`NFT minted successfully. Token ID: ${tokenId}, Token URI: ${ipfsUrl}`);
          } catch (error) {
              console.error("Error minting NFT:", error);
          }
      }
        console.log(`Encrypted data uploaded to IPFS: ${ipfsUrl}`);
    } catch (error) {
        console.error('Error during encryption or upload:', error);
    } finally {
        setLoading(false);
    }
};

  if (!account) {
    return (
      <div>
        <h2>Connect to Ethereum</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Data Encryption & Upload</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <NFTConditionBuilder
        enabled={true}
        condition={condition}
        setConditions={setCondition}
      />
      <button onClick={encryptAndUpload} disabled={loading || !fileContent}>
        {loading ? 'Processing...' : 'Encrypt & Upload'}
      </button>

      {loading && <Spinner loading={loading} />}
    </div>
  );
}
