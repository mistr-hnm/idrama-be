# GEMINI.md

## Project Overview

This is a [NestJS](https://nestjs.com/) project, a framework for building efficient and scalable server-side applications. The project is in its early stages, with a basic setup and a number of dependencies that suggest planned features.

**Key Technologies:**

*   **Framework:** NestJS
*   **Language:** TypeScript
*   **API Style:** GraphQL (indicated by `@nestjs/graphql` and `apollo-server-lambda`)
*   **Database:** PostgreSQL (indicated by `pg` and `typeorm`)
*   **Deployment:** Serverless (indicated by `serverless` and `@vendia/serverless-express`)
*   **Testing:** Jest
*   **Linting & Formatting:** ESLint and Prettier

**Architecture:**

The project follows the standard NestJS modular architecture. The main application module is `AppModule`, located in `src/app.module.ts`. The application entry point is `src/main.ts`.

## Building and Running

**Installation:**

```bash
npm install
```

**Running the application:**

*   **Development mode:**
    ```bash
    npm run start:dev
    ```
*   **Production mode:**
    ```bash
    npm run build
    npm run start:prod
    ```

**Testing:**

*   **Unit tests:**
    ```bash
    npm run test
    ```
*   **End-to-end tests:**
    ```bash
    npm run test:e2e
    ```
*   **Test coverage:**
    ```bash
    npm run test:cov
    ```

## Development Conventions

*   **Linting:** The project uses ESLint to enforce code quality. Run `npm run lint` to check for and fix linting errors.
*   **Formatting:** The project uses Prettier to maintain a consistent code style. Run `npm run format` to format the codebase.
*   **Git:** The project is a git repository. A `.gitignore` file is present to exclude common files and directories from source control.


## configurate the BE files
- modules
    - auth
        - auth.module.ts
        - jwt.gaurd.ts
        - auth.service.ts
    - media
        - movies
        - series