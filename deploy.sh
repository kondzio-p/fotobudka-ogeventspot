#!/bin/bash

# Deployment script for fotobudka-ogeventspot.pl
# Run this script from /var/www/fotobudka-ogeventspot.pl/public_html on your VPS

echo "🚀 Starting deployment for fotobudka-ogeventspot.pl..."

# Ensure we're in the right directory
cd /var/www/fotobudka-ogeventspot.pl/public_html

# Create logs directory
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing application if running
echo "🛑 Stopping existing application..."
pm2 stop fotobudka-ogeventspot 2>/dev/null || true
pm2 delete fotobudka-ogeventspot 2>/dev/null || true

# Start application with PM2
echo "▶️ Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ Deployment completed!"
echo "📊 Check application status: pm2 status"
echo "📝 View logs: pm2 logs fotobudka-ogeventspot"
echo "🔄 Restart app: pm2 restart fotobudka-ogeventspot"