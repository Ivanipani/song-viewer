# Song Viewer

My personal song portfolio.

## Deployment

The application is deployed using Ansible playbooks. The backend is an NGINX server that serves both the React frontend and the media files (audio and photos).

### Production Deployment

```zsh
just deploy-prod
```

The `playbook/deploy-prod.yml` playbook performs the following steps:

1. **Install and Configure NGINX**: Installs NGINX on the web server and sets up handlers for service restarts.

2. **Deploy Media Files**: 
   - Creates directories for audio files (`/public/song-viewer/canciones`) and photos (`/public/song-viewer/fotos`)
   - Copies audio files from local source directory to the server
   - Copies photos from local source directory to the server
   - Copies `catalog.yml` from the catalog-manager project to the audio directory on the server
   - Sets proper ownership (www-data) and permissions for all media files

3. **Build React App Locally**:
   - Clones the repository from GitHub to a temporary directory
   - Installs npm dependencies
   - Builds the React application

4. **Deploy React App to Server**:
   - Creates the web app directory (`/var/www/song-viewer`) on remote server
   - Copies the built React files to the server
   - Configures NGINX site using the `nginx-react-app.conf.j2` template
   - Enables the NGINX site by creating a symlink in `sites-enabled`

### NGINX Configuration

NGINX is configured to serve:
- **React App** (`/`): Serves the built React application with SPA routing support. The `index.html` file has short cache headers (60s) to allow for quick updates.
- **Audio Files** (`/canciones`): Serves audio files (MP3, OGG, WAV, AAC, FLAC) with 1-hour cache headers and CORS support for allowed origins.
- **Photos** (`/fotos`): Serves photos with JSON directory listing enabled and 1-hour cache headers.

### Local Development Deployment

```zsh
just deploy-local
```

For local development, use `playbook/deploy-local.yml` which:
- Builds the React app with `npm run build-dev`
- Deploys the catalog to the local audio directory
- Configures NGINX on localhost (port 5001) using Homebrew
