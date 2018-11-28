#!/bin/bash
sudo apt-get update && sudo apt-get upgrade

#Install curl
sudo apt install curl

#Install NodeJS and NPM
curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
sudo apt-get install -y nodejs

#Install Redis
# Download and Extract the Source Code
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable

# Build and Install Redis
make
make test
make install

# Configure Redis
mkdir /etc/redis
cp /tmp/redis-stable/redis.conf /etc/redis
sed -i "s/^supervised no/supervised systemd/" /etc/redis/redis.conf
sed -i "s/^dir \.\//dir \/var\/lib\/redis/" /etc/redis/redis.conf

#create service config
cat >/etc/systemd/system/redis.service <<EOL
[Unit]
Description=Redis In-Memory Data Store
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis.conf
ExecStop=/usr/local/bin/redis-cli shutdown
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# Create the Redis User, Group and Directories
adduser --system --group --no-create-home redis
mkdir /var/lib/redis
chown redis:redis /var/lib/redis
chmod 770 /var/lib/redis

# Start Redis
systemctl start redis

# Enable Redis to Start at Boot
systemctl enable redis

# Clean Up
rm -rf /tmp/redis-stable
rm /tmp/redis-stable.tar.gz

# Install Postgres
sudo add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main"
wget -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql-9.6 -y

# Set Password
echo
echo "You will now set the default password for the postgres user."
echo "This will open a psql terminal, enter:"
echo
echo "\\password postgres"
echo
echo "and follow instructions for setting postgres admin password."
echo "Press Ctrl+D or type \\q to quit psql terminal"
echo "START psql --------"
sudo -u postgres psql postgres
echo "END psql --------"
echo

# Create Example Database
sudo -u postgres psql  -f "./setup-db.sql"

# Install Utility for Creating Multi-Part Swagger Docs
sudo npm install -g multi-file-swagger