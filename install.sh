#!/bin/bash

install_ubuntu_packages() {
  sudo apt-get update
  sudo apt-get install -y curl redis-server libheif-examples
}

install_centos_packages() {
  sudo yum install -y epel-release
  sudo yum install -y redis curl libheif-examples
}

install_node() {
  if ! command -v node &> /dev/null || [ "$(node -v | sed 's/v//')" \< "16" ]; then
    echo "Installing NVM and Node.js LTS version..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
    nvm install --lts
  fi
}

if grep -qEi "(debian|ubuntu)" /etc/*release; then
  install_ubuntu_packages
elif grep -qEi "(centos|red hat|redhat)" /etc/*release; then
  install_centos_packages
fi

install_node

sudo mkdir -p /opt/moments
cd /opt/moments
git clone https://github.com/RandallAnjie/moments.git
cd moments

npm install
npx prisma migrate dev
npm run build

curl -o data/db.sqlite https://randallanjie.com/download/db.sqlite

echo "[Unit]
Description = moments
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
WorkingDirectory=/opt/moments/moments
ExecStart = $(which node) /opt/moments/moments/.output/server/index.mjs
EnvironmentFile = /opt/moments/moments/.env

[Install]
WantedBy = multi-user.target
" | sudo tee /etc/systemd/system/moments.service

sudo systemctl daemon-reload
sudo systemctl start moments
sudo systemctl enable moments
