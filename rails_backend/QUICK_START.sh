#!/bin/bash

# Quick Start Script for Rails Backend

set -e

echo "🚀 Starting Rails Backend Setup..."

# Navigate to Rails backend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
bundle install

# Create directories
echo "📁 Creating directories..."
mkdir -p db
mkdir -p public/uploads
mkdir -p backups

# Create database
echo "🗄️  Creating database..."
rails db:create

# Run migrations
echo "🔄 Running migrations..."
rails db:migrate

echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  rails server -p 3001"
echo ""
echo "To migrate existing data, run:"
echo "  rails data:migrate"
echo ""
