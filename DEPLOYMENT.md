# Deployment Guide for fotobudka-ogeventspot.pl

## Prerequisites
- Ubuntu 25.04 VPS
- Node.js 18.20.8
- Apache2
- Domain: fotobudka-ogeventspot.pl

## Step-by-Step Deployment

### 1. Upload project to VPS
```bash
# Create directory
sudo mkdir -p /var/www/fotobudka-ogeventspot
sudo chown $USER:$USER /var/www/fotobudka-ogeventspot

# Upload your project files to /var/www/fotobudka-ogeventspot
# You can use scp, rsync, or git clone
```

### 2. Install PM2 globally
```bash
sudo npm install -g pm2
```

### 3. Configure environment
```bash
cd /var/www/fotobudka-ogeventspot

# Create production .env file
cp .env .env.production
nano .env.production

# Update credentials in .env.production:
# ADMIN_LOGIN=your_secure_login
# ADMIN_PASSWORD=your_secure_password
# NODE_ENV=production
```

### 4. Run deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. Configure Apache
```bash
# Copy Apache configuration
sudo cp fotobudka-ogeventspot.conf /etc/apache2/sites-available/

# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo a2enmod expires

# Enable the site
sudo a2ensite fotobudka-ogeventspot.conf

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### 6. Setup SSL with Certbot
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d fotobudka-ogeventspot.pl -d www.fotobudka-ogeventspot.pl

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Setup PM2 startup
```bash
# Generate startup script
pm2 startup

# Copy and run the command that PM2 outputs
# It will look something like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

# Save PM2 configuration
pm2 save
```

### 8. Verify deployment
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs fotobudka-ogeventspot

# Check if site is accessible
curl -I http://localhost:3001/api/health
```

## Useful Commands

### PM2 Management
```bash
# View application status
pm2 status

# View logs
pm2 logs fotobudka-ogeventspot

# Restart application
pm2 restart fotobudka-ogeventspot

# Stop application
pm2 stop fotobudka-ogeventspot

# Monitor resources
pm2 monit
```

### Apache Management
```bash
# Check Apache status
sudo systemctl status apache2

# Restart Apache
sudo systemctl restart apache2

# Check Apache logs
sudo tail -f /var/log/apache2/fotobudka-ogeventspot_error.log
sudo tail -f /var/log/apache2/fotobudka-ogeventspot_access.log
```

### SSL Certificate Management
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## File Permissions
Make sure the following directories have correct permissions:
```bash
sudo chown -R $USER:$USER /var/www/fotobudka-ogeventspot
chmod -R 755 /var/www/fotobudka-ogeventspot
chmod -R 755 /var/www/fotobudka-ogeventspot/public/assets
```

## Troubleshooting

### If the site doesn't load:
1. Check PM2 status: `pm2 status`
2. Check Apache error logs: `sudo tail -f /var/log/apache2/fotobudka-ogeventspot_error.log`
3. Check if port 3001 is accessible: `curl http://localhost:3001/api/health`

### If uploads don't work:
1. Check directory permissions in `/var/www/fotobudka-ogeventspot/public/assets`
2. Check PM2 logs: `pm2 logs fotobudka-ogeventspot`

### If admin panel doesn't work:
1. Check if environment variables are loaded correctly
2. Verify credentials in `.env.production`
3. Check browser console for errors