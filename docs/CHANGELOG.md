# Changelog

## [2026-01-11] - Debugging & Stabilization

### Fixed

-   **Auth**: Fixed `DYNAMIC_SERVER_USAGE` errors being swallowed in `OnboardingCheckWrapper`, allowing proper dynamic rendering fallback.
-   **Projects**: Added cycle detection to `addProjectDependency` to prevent infinite dependency loops (deadlocks) when creating ad-hoc item dependencies.
-   **Client Safety**: Fixed unsafe error casting in `EmailsAndAuth.tsx` that could cause crashes if non-Error objects were thrown.
-   **Database**: Removed verbose "Prisma Client Initialized" logs during build.
