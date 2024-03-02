import React, { useState, useEffect } from 'react';
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config';
import { ThresholdMessageKit,   decrypt,getPorterUri } from '@nucypher/taco';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
const DataNFTABI = "DataNFTABIs"; // Adjust the path as necessary
const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const ipfsClient = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

const DecryptPage = () => {
    const [nftUris, setNftUris] = useState<string[]>([]);
    const [decryptedData, setDecryptedData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const dataNFTContract = new ethers.Contract(contractAddress, DataNFTABI, signer);

        const fetchNFTUris = async () => {
            setLoading(true);
            try {
                const totalNFTs = await dataNFTContract.getTotalNFTs();
                const uris: string[] = [];
                for (let i = 0; i < totalNFTs; i++) {
                    const uri = await dataNFTContract.uris(i);
                    uris.push(uri);
                }
                setNftUris(uris);
            } catch (error) {
                console.error('Error fetching NFT URIs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTUris();
    }, []);

    const fetchDataFromIPFS = async (ipfsUri: string) => {
        try {
            const cid = ipfsUri.replace('ipfs://', '');
            let content = '';
            for await (const chunk of ipfsClient.cat(cid)) {
                content += new TextDecoder().decode(chunk);
            }
            // Await the onDecrypt function to get the decrypted data
            const decryptedContent = await onDecrypt(content);
            return decryptedContent; // This should now be a string or null
        } catch (error) {
            console.error('Error fetching data from IPFS:', error);
            return null;
        }
    };
    
    const onDecrypt = async (encryptedMessage: string) => {
        if (!encryptedMessage) {
          return null; // Return null if no encrypted message is provided
        }
        const mkBytes = Buffer.from(encryptedMessage, 'base64');
        const mk = ThresholdMessageKit.fromBytes(mkBytes);
        return decryptMessage(mk); // Return the promise from decryptMessage
    };
    
    const decryptMessage = async (encryptedMessage: ThresholdMessageKit) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const decryptedMessage = await decrypt(
            provider,
            domain,
            encryptedMessage,
            getPorterUri(domain),
            provider.getSigner(),
        );
        return new TextDecoder().decode(decryptedMessage); // Return the decoded message
    };

    const decryptAndShowData = async (ipfsUri: string) => {
        setLoading(true);
        try {
            const data = await fetchDataFromIPFS(ipfsUri); // This awaits the decrypted data
            setDecryptedData(data); // Set the decrypted data directly
        } catch (error) {
            console.error('Error decrypting/fetching data:', error);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div>
            <h2>Decrypt and View NFT Data</h2>
            {loading && <p>Loading...</p>}
            <ul>
                {nftUris.map((uri, index) => (
                    <li key={index}>
                        <button onClick={() => decryptAndShowData(uri)}>View NFT #{index + 1}</button>
                    </li>
                ))}
            </ul>
            {decryptedData && (
                <div>
                    <h3>Decrypted NFT Data:</h3>
                    <p>{decryptedData}</p>
                </div>
            )}
        </div>
    );
};

export default DecryptPage;
