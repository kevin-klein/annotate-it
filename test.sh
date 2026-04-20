SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/frontend" && yarn test
cd "$SCRIPT_DIR/backend" && bin/rails test
