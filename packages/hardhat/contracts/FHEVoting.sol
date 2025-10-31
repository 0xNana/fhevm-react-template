// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32, externalEbool } from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**  
 * @title FHEVoting  
 * @dev A confidential voting contract using FHEVM  
 * @notice This contract allows users to vote on proposals with encrypted votes  
 */  
contract FHEVoting is SepoliaConfig {  
    // Voting session structure  
    struct VotingSession {  
        string title;  
        string description;  
        euint32 yesVotes;  
        euint32 noVotes;  
        euint32 totalVotes;  
        bool isActive;  
        uint256 endTime;  
    }  
      
    // Mapping of session ID to voting session  
    mapping(uint256 => VotingSession) public votingSessions;  
      
    // Mapping of user to session to track if they've voted  
    mapping(address => mapping(uint256 => bool)) public hasVoted;  
      
    // Session counter  
    uint256 public sessionCounter = 1;  
      
    // Events  
    event VotingSessionCreated(uint256 indexed sessionId, string title, uint256 endTime);  
    event VoteCast(address indexed voter, uint256 indexed sessionId);  
    event VotingSessionEnded(uint256 indexed sessionId);  
      
    /**  
     * @dev Create a new voting session  
     * @param title The title of the voting session  
     * @param description The description of the voting session  
     * @param duration The duration of the voting session in seconds  
     */  
    function createVotingSession(  
        string memory title,  
        string memory description,  
        uint256 duration  
    ) public {  
        uint256 sessionId = sessionCounter++;  
        uint256 endTime = block.timestamp + duration;  
          
        votingSessions[sessionId] = VotingSession({  
            title: title,  
            description: description,  
            yesVotes: FHE.asEuint32(0),  
            noVotes: FHE.asEuint32(0),  
            totalVotes: FHE.asEuint32(0),  
            isActive: true,  
            endTime: endTime  
        });  
        
        // Allow access to the encrypted values for the caller
        FHE.allowThis(votingSessions[sessionId].yesVotes);
        FHE.allowThis(votingSessions[sessionId].noVotes);
        FHE.allowThis(votingSessions[sessionId].totalVotes);
        FHE.allow(votingSessions[sessionId].yesVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].noVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].totalVotes, msg.sender);
          
        emit VotingSessionCreated(sessionId, title, endTime);  
    }  
      
    /**  
     * @dev Cast a vote on a voting session  
     * @param sessionId The ID of the voting session  
     * @param vote The encrypted vote (1 for yes, 0 for no)  
     * @param inputProof The proof for the encrypted vote  
     */  
    function castVote(uint256 sessionId, externalEuint32 vote, bytes calldata inputProof) public {  
        require(votingSessions[sessionId].isActive, "Voting session is not active");  
        require(block.timestamp <= votingSessions[sessionId].endTime, "Voting session has ended");  
        require(!hasVoted[msg.sender][sessionId], "User has already voted");  
          
        euint32 encryptedVoteInt = FHE.fromExternal(vote, inputProof);  
        
        // Allow access to the encrypted vote for operations
        FHE.allowThis(encryptedVoteInt);
        FHE.allow(encryptedVoteInt, msg.sender);
          
        // Mark user as having voted  
        hasVoted[msg.sender][sessionId] = true;  
          
        // Increment total votes  
        votingSessions[sessionId].totalVotes = FHE.add(  
            votingSessions[sessionId].totalVotes,  
            FHE.asEuint32(1)  
        );  
          
        // Add vote to appropriate counter using integer logic  
        // encryptedVoteInt: 1 = yes vote, 0 = no vote  
        euint32 one = FHE.asEuint32(1);  
        
        // Allow access to the constant value
        FHE.allowThis(one);
        FHE.allow(one, msg.sender);
          
        // If vote is 1 (yes), add 1 to yes votes and 0 to no votes  
        // If vote is 0 (no), add 0 to yes votes and 1 to no votes  
        euint32 yesIncrement = encryptedVoteInt;  // 1 if yes, 0 if no  
        euint32 noIncrement = FHE.sub(one, encryptedVoteInt);  // 0 if yes, 1 if no  
        
        // Allow access to the increment values
        FHE.allowThis(yesIncrement);
        FHE.allowThis(noIncrement);
        FHE.allow(yesIncrement, msg.sender);
        FHE.allow(noIncrement, msg.sender);
          
        votingSessions[sessionId].yesVotes = FHE.add(  
            votingSessions[sessionId].yesVotes,  
            yesIncrement  
        );  
          
        votingSessions[sessionId].noVotes = FHE.add(  
            votingSessions[sessionId].noVotes,  
            noIncrement  
        );  
          
        // Allow access to the updated values  
        FHE.allowThis(votingSessions[sessionId].yesVotes);  
        FHE.allowThis(votingSessions[sessionId].noVotes);  
        FHE.allowThis(votingSessions[sessionId].totalVotes);  
        FHE.allow(votingSessions[sessionId].yesVotes, msg.sender);  
        FHE.allow(votingSessions[sessionId].noVotes, msg.sender);  
        FHE.allow(votingSessions[sessionId].totalVotes, msg.sender);  
          
        emit VoteCast(msg.sender, sessionId);  
    }  
      
    /**  
     * @dev End a voting session  
     * @param sessionId The ID of the voting session to end  
     */  
    function endVotingSession(uint256 sessionId) public {  
        require(votingSessions[sessionId].isActive, "Voting session is not active");  
        require(block.timestamp > votingSessions[sessionId].endTime, "Voting session has not ended yet");  
          
        votingSessions[sessionId].isActive = false;  
        emit VotingSessionEnded(sessionId);  
    }  
      
    /**  
     * @dev Get the encrypted results of a voting session (for ended sessions)  
     * @param sessionId The ID of the voting session  
     * @return yesVotes The encrypted number of yes votes  
     * @return noVotes The encrypted number of no votes  
     * @return totalVotes The encrypted total number of votes  
     */  
    function getEncryptedResults(uint256 sessionId) public returns (  
        euint32 yesVotes,  
        euint32 noVotes,  
        euint32 totalVotes  
    ) {  
        require(!votingSessions[sessionId].isActive, "Voting session is still active");  
        
        // Allow access to the encrypted values for the caller
        FHE.allowThis(votingSessions[sessionId].yesVotes);
        FHE.allowThis(votingSessions[sessionId].noVotes);
        FHE.allowThis(votingSessions[sessionId].totalVotes);
        FHE.allow(votingSessions[sessionId].yesVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].noVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].totalVotes, msg.sender);
          
        return (  
            votingSessions[sessionId].yesVotes,  
            votingSessions[sessionId].noVotes,  
            votingSessions[sessionId].totalVotes  
        );  
    }
    
    /**  
     * @dev Get the current encrypted vote counts for an active voting session  
     * @param sessionId The ID of the voting session  
     * @return yesVotes The encrypted number of yes votes  
     * @return noVotes The encrypted number of no votes  
     * @return totalVotes The encrypted total number of votes  
     */  
    function getCurrentVoteCounts(uint256 sessionId) public returns (  
        euint32 yesVotes,  
        euint32 noVotes,  
        euint32 totalVotes  
    ) {  
        require(votingSessions[sessionId].isActive, "Voting session is not active");  
        
        // Allow access to the encrypted values for the caller
        FHE.allowThis(votingSessions[sessionId].yesVotes);
        FHE.allowThis(votingSessions[sessionId].noVotes);
        FHE.allowThis(votingSessions[sessionId].totalVotes);
        FHE.allow(votingSessions[sessionId].yesVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].noVotes, msg.sender);
        FHE.allow(votingSessions[sessionId].totalVotes, msg.sender);
          
        return (  
            votingSessions[sessionId].yesVotes,  
            votingSessions[sessionId].noVotes,  
            votingSessions[sessionId].totalVotes  
        );  
    }  
      
    /**  
     * @dev Check if a user has voted on a specific session  
     * @param user The user's address  
     * @param sessionId The ID of the voting session  
     * @return True if the user has voted, false otherwise  
     */  
    function hasUserVoted(address user, uint256 sessionId) public view returns (bool) {  
        return hasVoted[user][sessionId];  
    }  
      
    /**  
     * @dev Get voting session information  
     * @param sessionId The ID of the voting session  
     * @return title The title of the voting session  
     * @return description The description of the voting session  
     * @return isActive Whether the voting session is active  
     * @return endTime The end time of the voting session  
     */  
    function getVotingSessionInfo(uint256 sessionId) public view returns (  
        string memory title,  
        string memory description,  
        bool isActive,  
        uint256 endTime  
    ) {  
        return (  
            votingSessions[sessionId].title,  
            votingSessions[sessionId].description,  
            votingSessions[sessionId].isActive,  
            votingSessions[sessionId].endTime  
        );  
    }  
}