pragma solidity ^0.4.18;

contract Record{
  string public _name;
  uint256 public _timestamp;
  uint256 public _score;
  address public _user;

  constructor( string name, uint256 timestamp, uint256 score, address user){
    _name = name;
    _timestamp = timestamp;
    _score = score;
    _user = user;
  }
}
contract Winner{
  struct Record {
    string public _name;
    uint256 public _timestamp;
    uint256 public _score;
    //address public _user;
  }
  mapping(address => Record) public winner;
  address[] public winnerAccts;

  event NewWinnerRecord(address user, uint256 timestamp);

  function addRecord(string name, uint256 timestamp, uint256 score, address user){
    var record = winner[user];

    record._name = name;
    record._timestamp = timestamp;
    record._score = score;
    //record._user = user;

    winnerAccts.push(user) -1;

    NewWinnerRecord(user, timestamp)
  }

  function getAllRecord() public returns (address[]){
    return winnerAccts
  }

  function getRecord( address _user) view public returns (string, uint256, uint256){
    return (
      winner[_user]._name,
      winner[_user]._timestamp,
      winner[_user]._score
    )
  } 

  function countRecord() view public returns (uint){
    return winnerAccts.length
  }
}