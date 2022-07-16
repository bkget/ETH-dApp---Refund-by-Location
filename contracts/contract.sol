// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.9.0;


import "hardhat/console.sol";

contract Refund {
    address owner; 

    // Map employee name and address to employee list
    struct employeesList{
        string name; 
        address empaddress;
    }
    
    // Map the employee details to employeeDetail
    struct EmployeeDetail { 
        uint256 latitude;
        uint256 longitude;
        uint256 allowedDistance;
        uint256 amount;
    }
    mapping (address => employeesList) employeeList;
    mapping(address => bool) public employeeCondition;
    address[] public employees;


    constructor() {
        owner = msg.sender;
        console.log("Deploying a Refund with Owner:", owner);
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function createEmployee(address empAddress, string memory name, uint256 latitude, uint256 longitude, uint256 allowedDistance) public {
        // restrict employee creation to owner
        require(msg.sender == owner);
        // set Employee address using the employeeList mapping
        employeeList[empAddress].empaddress = empAddress;
        // set Employee name using the employeeList mapping
        employeeList[empAddress].name = name;
        // set Employee latitude using the EmployeeDetail struct mapping
        employeeList[empAddress].EmployeeDetail.latitude = latitude;
        // set Employee longitude using the employeeDetail struct mapping
        employeeList[empAddress].EmployeeDetail.longitude = longitude;
        // set the Employee's allowed distance using the employeeDetail struct mapping
        employeeList[empAddress].EmployeeDetail.allowedDistance = allowedDistance;
        // push user address into userAddresses array
        employees.push(empAddress);
    }
EmployeeDetail
    function getEmployeeDetail(address empAddress) public view returns (string memory, uint256, uint256, uint256) {
        return (employeeDetail[empAddress].name, employeeDetail[empAddress].latitude, employeeDetail[empAddress].longitude, employeeDetail[empAddress].allowedDistance);
    }

    function getEmployees() public view returns (address[] memory) {
        return employees;
    }

    function ingestCoordinate(uint256 latitude, uint256 longitude, uint256 etimestamp) public  {
       require(etimestamp >= 0 && etimestamp <= 86400);
       uint256 distance = calculateDistance(latitude, longitude);
       if (distance > employeeDetail[msg.sender].allowedDistance) {
           employeeCondition[msg.sender] = false;
       } else {
           employeeCondition[msg.sender] = true;
       }
    }

    // Find the square root of a number using the Babylonian method
    function sqrt(uint x) public pure returns (uint y) {
    uint z = (x + 1) / 2;
    y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function calculateDistance(uint256 lat, uint256 lon) public view returns (uint256 dist)
    {
        (,uint256 lat1, uint256 lon1,) = getEmployeeDetail(msg.sender);

        uint256 distance = uint256(sqrt((lat - lat1) ** 2 + (lon - lon1) ** 2));
        return uint256(distance);
    }
}