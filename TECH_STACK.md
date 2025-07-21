# Backend Tech Stack

This document outlines the primary technologies and libraries used in the `backend` project.

## Core Framework

*   **[NestJS](https://nestjs.com/)**: A progressive [Node.js](https://nodejs.org/) framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript and is built on top of Express.js.
*   **[TypeScript](https://www.typescriptlang.org/)**: The entire codebase is written in TypeScript, providing strong typing and improved developer experience.

## API Layer

*   **[GraphQL](https://graphql.org/)**: The backend exposes a GraphQL API for flexible and efficient data fetching.
*   **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)**: The project uses the Apollo Server integration for NestJS to handle GraphQL requests.

## Database and ORM

*   **[Prisma](https://www.prisma.io/)**: A next-generation ORM for Node.js and TypeScript. It is used to interact with the database, manage schema migrations, and ensure type-safe database access.

## Authentication

*   **[Passport.js](http://www.passportjs.org/)**: A popular authentication middleware for Node.js. The project is configured with:
    *   **JWT (JSON Web Tokens)**: For stateless, token-based authentication.
    *   **Local Strategy**: For traditional email/password authentication.
*   **[bcrypt](https://www.npmjs.com/package/bcrypt)**: Used for hashing passwords before storing them in the database.

## Local Dependencies

*   **`@vandelay-labs/schemas`**: The project depends on a local package located in the `../schemas` directory. This likely contains shared data schemas and types (e.g., Zod schemas, TypeScript interfaces) used across different parts of the Vandelay Labs monorepo.

## Testing

*   **[Jest](https://jestjs.io/)**: The primary framework for unit and end-to-end (e2e) testing.
*   **[Supertest](https://www.npmjs.com/package/supertest)**: Used in e2e tests to simulate HTTP requests to the NestJS application.
