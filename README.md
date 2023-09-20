# Monorepo README

## Prerequisites

- [Node.js](https://nodejs.org/en/download/) v16.19
- NPM v9.4.2

## Installation

`npm i`

## Generating files

When you make changes to the contracts, you will need to generate new typescript files for the frontend to use. This is done by running the following commands:

1.  Generate solidity files, run:

`yarn core:generate`

2.  Generate webapp files, run:

`yarn web:generate`

## Running the hardhat local server

1.  Start the hardhat local server by running:

`npm run core:dev`

## Running the Next.js frontend

1.  Start the Next.js frontend by running:

`npm run web:dev`

