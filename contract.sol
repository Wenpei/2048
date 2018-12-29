pragma solidity ^0.4.25;

contract Winner{
  struct Record {
    string _name;
    uint256 _timestamp;
    uint256 _score;
    //address _user;
  }
  mapping(address => Record) public winner;
  address[] public winnerAccts;

  event NewWinnerRecord(address user, uint256 timestamp);

  function addRecord(string name, uint256 score, address user) public {
    Record storage record = winner[user];

    record._name = name;
    record._timestamp = now;
    record._score = score;
    //record._user = user;

    winnerAccts.push(user) -1;

    emit NewWinnerRecord(user, now);
  }

  function getAllRecord() view public returns (address[]){
    return winnerAccts;
  }

  function getRecord( address _user) view public returns (string, uint256, uint256){
    return (
      winner[_user]._name,
      winner[_user]._timestamp,
      winner[_user]._score
    );
  } 

  function countRecord() view public returns (uint){
    return winnerAccts.length;
  }
}