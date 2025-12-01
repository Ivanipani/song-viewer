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
    PLAYBOOK=$(ls deploy*.yml | fzf)
    TASK=$(ansible-playbook --list-tasks $PLAYBOOK | grep 'TAGS:' | grep -vE "play\s#\d" | awk '{sub(/[[:space:]]*TAGS:.*/, ""); sub(/^[[:space:]]+/, ""); print}' | fzf)

    if [ -z "$TASK" ]; then
        echo "No task selected. Exiting."
        exit 1
    fi
    echo "Starting from task: $TASK"
    ansible-playbook $PLAYBOOK --start-at-task "$TASK"

# Run a single playbook
[script("zsh")]
[working-directory: 'playbook']
run-single:
    PLAYBOOK=$(ls deploy*.yml | fzf)
    echo "Running playbook: $PLAYBOOK"
    ansible-playbook "$PLAYBOOK"

# Run catalog-manager
[working-directory: 'catalog-manager']
catalog-manager *args:
    uv run catalog-manager {{args}}

