# 🚀 AWS EC2 Deployment Guide for MakeThemBroke Hono AI Gateway

This guide covers deploying the **MakeThemBroke Hono AI Gateway** (`backend/src/index.ts`) to an **AWS EC2 instance** (Ubuntu 22.04 / 24.04 LTS) using **Bun**, **Docker**, and **Nginx Reverse Proxy**.

---

## 📋 Prerequisites

- AWS EC2 Instance (t3.micro or t3.small, Ubuntu 22.04 LTS)
- Inbound Security Group rules enabled:
  - **HTTP (Port 80)**
  - **HTTPS (Port 443)**
  - **SSH (Port 22)**
  - **Custom TCP (Port 3000)** (optional for direct testing)
- Domain pointing to EC2 Elastic IP: `makethembroke.com`

---

## Option 1: Direct Bun Deployment via Systemd (Recommended)

### Step 1: Install Bun & Node on EC2
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

### Step 2: Clone & Setup Code
```bash
git clone <your-repo-url> app
cd app/backend
bun install
```

### Step 3: Configure Environment Variables
Create `.env` file in `backend`:
```env
PORT=3000
DOMAIN=makethembroke.com
BACKEND_URL=https://runtime.us-east-1.kiro.dev
MODEL_ID=gpt-5.6-sol
AGENT_MODE=default
AUTH_TOKEN=your_kiro_bearer_token_here
PROFILE_ARN=arn:aws:codewhisperer:us-east-1:...
```

### Step 4: Setup Systemd Service
Create `/etc/systemd/system/hono-gateway.service`:
```ini
[Unit]
Description=MakeThemBroke Hono AI Gateway
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/app/backend
ExecStart=/home/ubuntu/.bun/bin/bun run src/index.ts
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hono-gateway
sudo systemctl start hono-gateway
sudo systemctl status hono-gateway
```

---

## Option 2: Docker Deployment

### Step 1: Build & Run Container
```bash
cd backend
docker build -t makethembroke-hono .
docker run -d -p 3000:3000 --env-file .env --name hono-ai-gateway --restart always makethembroke-hono
```

### Step 2: Using Docker Compose
```bash
docker-compose up -d --build
```

---

## 🌐 Nginx Reverse Proxy & SSL (`makethembroke.com`)

### Step 1: Install Nginx & Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Step 2: Configure Nginx Site
Create `/etc/nginx/sites-available/makethembroke.com`:
```nginx
server {
    server_name makethembroke.com api.makethembroke.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Enable SSE Streaming
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/makethembroke.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Enable SSL Certificate
```bash
sudo certbot --nginx -d makethembroke.com -d api.makethembroke.com
```

---

## 🧪 Testing API Endpoints

- **Health Check**:
  ```bash
  curl https://makethembroke.com/health
  ```
- **Anthropic Messages Endpoint**:
  ```bash
  curl -N -X POST https://makethembroke.com/v1/messages \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello!"}],"stream":true}'
  ```

---

## 🤖 Configuring Claude Code CLI to use `makethembroke.com`

Update `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "local-key",
    "ANTHROPIC_BASE_URL": "https://makethembroke.com"
  }
}
```
