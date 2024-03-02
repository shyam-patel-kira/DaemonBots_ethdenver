// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol"; // Import FHE library

contract PredictiveMaintenanceEncrypted {
    // Encrypted model parameters (pre-calculated off-chain and encrypted)
    euint32 private beta0;
    euint32 private beta1;

    function asEuint32(uint256 value) internal pure returns (euint32) {
        return euint32.wrap(Impl.trivialEncrypt(value, Common.EUINT32_TFHE_GO));
    }

    function asEuint32I(inEuint32 memory value) internal pure returns (euint32) {
        return FHE.asEuint32(value.data);
    }

    function decrypt(euint32 input1) internal pure returns (uint32) {
        uint256 unwrappedInput1 = euint32.unwrap(input1);
        bytes memory inputAsBytes = Common.toBytes(unwrappedInput1);
        uint256 result = FheOps(Precompiles.Fheos).decrypt(Common.EUINT32_TFHE_GO, inputAsBytes);
        return Common.bigIntToUint32(result);
    }

    function asEbool(bool value) internal pure returns (ebool) {
        uint256 sVal = 0;
        if (value) {
            sVal = 1;
        }
        return asEbool1(sVal);
    }

    function asEbool1(uint256 value) internal pure returns (ebool) {
        return ebool.wrap(Impl.trivialEncrypt(value, Common.EBOOL_TFHE_GO));
    }

    // Fixed-point base to handle fixed-point arithmetic
    uint256 private constant BASE = 1e6;

    // Threshold for triggering maintenance (e.g., 50% probability of failure, encrypted)
    euint32 private FAILURE_THRESHOLD = asEuint32(BASE / 2); // Encrypted 0.5 in fixed-point representation

    // Event to notify of maintenance requirement
    event MaintenanceRequired(address indexed equipment, uint256 operatingHours);

    constructor(euint32 _beta0, euint32 _beta1) {
        beta0 = _beta0;
        beta1 = _beta1;
    }

    // Function to update operating hours and check for maintenance requirement with encrypted values
    function updateOperatingHours(inEuint32 memory operatingHoursEnc) external {
        // Decrypt operating hours for internal computation - assuming decryption is needed for comparison
        // Note: In a real scenario, you might handle this differently to maintain encryption throughout
        euint32 operatingHoursEncEuint = asEuint32I(operatingHoursEnc);
        uint256 operatingHours = decrypt(operatingHoursEncEuint);

        // Encrypted calculation of the probability of failure
        euint32 probabilityOfFailureEnc = FHE.add(beta0, FHE.mul(beta1, asEuint32(uint256(operatingHours) / BASE)));

        // Check if maintenance is required based on encrypted values
        uint256 probabilityOfFailure = decrypt(probabilityOfFailureEnc);
        uint256 failureThreshold = decrypt(FAILURE_THRESHOLD);
        if (probabilityOfFailure >= failureThreshold) {
            emit MaintenanceRequired(msg.sender, operatingHours);
        }
    }

    // Encrypted getter functions for the model parameters (optional)
    function getModelParametersEnc() external view returns (euint32, euint32) {
        return (beta0, beta1);
    }

    // Function to calculate and return the encrypted probability of failure for given encrypted operating hours (optional)
    function calculateProbabilityOfFailureEnc(inEuint32 memory operatingHoursEnc) external view returns (euint32) {
        uint256 operatingHours = decrypt(FHE.asEuint32(operatingHoursEnc)); // Assuming decryption for the purpose of demonstration
        return FHE.add(beta0, FHE.mul(beta1, asEuint32(uint256(operatingHours) / BASE)));
    }
}
