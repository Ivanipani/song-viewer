# Song Viewer

My personal song portfolio.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.2.3

## Available Just Commands

Run `just` to see all available commands:

```bash
just          # List all commands
just dev      # Start dev server
just build    # Production build
just test     # Run tests
just fresh    # Clean reinstall (removes node_modules, bun.lockb, and reinstalls)
```

## Deployment

The application is deployed using Ansible playbooks.
The backend is an NGINX server that serves both the React frontend and the media files (audio and photos).

### Production Deployment

```zsh
just deploy-prod
```

### Local Development Deployment

```zsh
just deploy-local
```

For local development, use `playbook/deploy-local.yml` which:
- Deploys the catalog to the local audio directory
- Configures NGINX on localhost (port 5001) using Homebrew

