set unstable
# Display this help
default:
    @just --list

# Configure NGINX + deploy React application to production
[working-directory: 'playbook']
deploy-prod:
    ansible-playbook deploy-prod.yml

[working-directory: 'playbook']
deploy-local:
    ansible-playbook -K deploy-local.yml

# Ping all servers
[working-directory: 'playbook']
ping:
    ansible all -m ping

# Select a playbook task using fzf and run from that task
[script("zsh")]
[working-directory: 'playbook']
deploy-task:
    TASK=$(ansible-playbook --list-tasks deploy-prod.yml | grep 'TAGS:' | grep -vE "play\s#\d" | awk '{sub(/[[:space:]]*TAGS:.*/, ""); sub(/^[[:space:]]+/, ""); print}' | fzf)

    if [ -z "$TASK" ]; then
        echo "No task selected. Exiting."
        exit 1
    fi
    echo "Starting from task: $TASK"
    ansible-playbook deploy-prod.yml --start-at-task "$TASK"

