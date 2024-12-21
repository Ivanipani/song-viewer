# Song Viewer

My personal song portfolio.

## Deployment

The backend for this project is an NGINX server. It serves the React frontend and the audio files.

This project is deployed using Ansible. The `playbook/deploy-prod.yml` playbook:
1) Builds the project (pulls from github)
2) Copies the built files to the server
3) Enables the NGINX site

The audio catalog is managed separately by the [catalog-manager](https://github.com/Ivanipani/catalog-manager) project.

### Runbook
In this project:
```
cd playbook
ansible-playbook -K deploy-prod.yml
``` 

In the catalog-manager project:
```
cd playbook
ansible-playbook -K deploy-prod.yml
``` 