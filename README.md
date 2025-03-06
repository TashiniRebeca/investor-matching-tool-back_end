# Investor Matching Tool - Backend

## Overview

The backend of the Investor Matching Tool is responsible for handling investor data, processing search queries, and serving results efficiently. This tool enables startups and entrepreneurs to match with suitable investors based on criteria such as sector, investment range, geography, etc.

The backend is built using Node.js with Express.js, and it integrates a database (MongoDB or PostgreSQL) to store and retrieve investor details. The API provides endpoints for searching investors using both Normal Search and Advanced Search criteria.

## Features

- Investor Data Management: Stores investor profiles, including sectors, funding stages, and location.

- Search Functionality: Provides Normal and Advanced search modes for filtered search and Manual search is there too.

- Filtering & Matching: Matches investors based on user-selected parameters.

- API Endpoints: Serves data in a structured format for the frontend.

## Tech Stack

- Backend Framework: Node.js (Express.js)

- Database: PostgreSQL

## Setup

### Prerequisites

- Node.js (v14+ recommended)

- MongoDB or PostgreSQL installed

### Steps to run locally

1. Clone the repsoitory
   
  `git clone https://github.com/your-repo/investor-matching-backend.git
cd investor-matching-backend`

2. Install Dependencies

   `npm install`
   
3. Run the server

   `npm start`
