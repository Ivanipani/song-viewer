# Display this help
default:
    @just --list

# Configure NGINX + deploy React application to production
[working-directory: 'playbook']
deploy-prod:
    ansible-playbook -K deploy-prod.yml

[working-directory: 'playbook']
deploy-local:
    ansible-playbook -K deploy-local.yml
