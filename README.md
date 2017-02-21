# URL

http://ec2.dustinbrett.com:3000/v1/ (ec2-54-187-178-83.us-west-2.compute.amazonaws.com)

# Installation

- git clone https://github.com/DustinBrett/iiaas.git
- npm install
- node server.js (Requires R/W permission to users.json)

# Usage

Register as a user
- curl -X "POST" http://ec2.dustinbrett.com:3000/v1/register --data "email={email address}&password={password}"

Get the next integer in the sequence
- curl http://ec2.dustinbrett.com:3000/v1/next -H "Authorization: Bearer {API key}"

Get the current integer
- curl http://ec2.dustinbrett.com:3000/v1/current -H "Authorization: Bearer {API key}"

Reset the current integer
- curl -X "PUT" http://ec2.dustinbrett.com:3000/v1/current -H "Authorization: Bearer {API key}" --data "current={non-negative integer}"