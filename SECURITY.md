# Security policy

## Reporting a vulnerability

Please **do not open a public issue**. Report it privately through GitHub:
**Security → Report a vulnerability** on this repository. You will get an answer within a few days.

## How the package is protected

- Published **only from GitHub Actions**, with npm **provenance**: every version on npm links to the exact commit
  and workflow that built it. Nobody publishes from a personal machine.
- **No install scripts**, and dependencies' install scripts are disabled in development and CI.
- **React is the only runtime requirement** (a peer dependency); everything else is development tooling.
- Dependencies are pinned by the lockfile and checked by `npm audit` on every change.
