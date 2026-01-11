# Timework

**Protocol-Driven Project Management**

Timework is a monorepo application designed to manage projects through defined protocols (SOPs).

## Tech Stack
-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Database**: PostgreSQL + Prisma
-   **Styling**: Tailwind CSS
-   **Workspace**: Turborepo

## Getting Started

### Prerequisites

-   Node.js 18+
-   pnpm (`npm i -g pnpm`)
-   PostgreSQL Database

### Installation

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Setup Environment**:
    Copy `.env.example` to `.env` (if available) or ensure valid `DATABASE_URL`.

3.  **Database Setup**:
    ```bash
    pnpm db:push
    # or
    cd packages/database && npx prisma db push
    ```

4.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

## Project Structure

-   `apps/web`: The main Next.js web application.
-   `packages/database`: Shared Prisma database schema and client.
-   `packages/config`: Shared configurations (eslint, typescript).

## Script Commands

-   `pnpm dev`: Start all apps in watch mode.
-   `pnpm build`: Build all apps and packages.
-   `pnpm lint`: Lint all codebases.
