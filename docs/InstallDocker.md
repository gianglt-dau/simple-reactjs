---

# ✅ Cách 1 (Khuyên dùng): Cài Docker + Compose chuẩn từ Docker repo

Đây là cách **đúng chuẩn production + CI/CD**.

---

## 🔹 Bước 1: Gỡ bản Docker cũ (nếu có)

```bash
sudo apt remove -y docker.io
```

---

## 🔹 Bước 2: Cài repo chính thức của Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

---

## 🔹 Bước 3: Cài Docker + Compose plugin

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 🔹 Bước 4: Kiểm tra

```bash
docker --version
docker compose version
```

> ✅ Phải thấy:

```bash
Docker version 24+
Docker Compose version v2+
```

---

## 🔹 Bước 5 (optional): chạy docker không cần sudo

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---
---

# 🎯 Kết luận

| Mục tiêu               | Nên dùng                  |
| ---------------------- | ------------------------- |
| Học lab nhanh          | `docker-compose`          |
| Làm CI/CD / production | `docker compose` (plugin) |

---
