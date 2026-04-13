# TÀI LIỆU THỰC HÀNH CHI TIẾT

**Chủ đề:** Deploy ứng dụng ReactJS từ thủ công đến CI/CD

---

## Mục tiêu chung

Sau khi hoàn thành 3 bài lab này, học viên sẽ:

- Hiểu quy trình build ứng dụng React thành file tĩnh và phục vụ bằng Nginx.
- Biết cách đưa ứng dụng lên VPS theo cách thủ công.
- Biết cách đóng gói ứng dụng bằng Docker với multi-stage build để tối ưu kích thước image.
- Biết cách tự động hóa build và deploy bằng GitHub Actions.
- Làm quen với quy trình rollback khi phiên bản mới gặp lỗi.

## Ứng dụng mẫu dùng trong toàn bộ bài lab

Toàn bộ bài thực hành sử dụng ứng dụng **Simple ReactJS** đã được chuẩn bị sẵn:

- Viết bằng **React 19 + Vite**
- Được phục vụ bởi **Nginx** trên cổng **80**
- Source code được lưu trên **GitHub** cá nhân
- Hệ điều hành máy chủ là **Ubuntu**

Cấu trúc thư mục dự án:

```
simple-reactjs/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── components/
├── public/
├── index.html
├── package.json
├── vite.config.js
├── nginx.conf
├── Dockerfile
└── docker-compose.yml
```

**Điểm khác biệt quan trọng so với Node.js:**

> Ứng dụng React **không chạy trực tiếp** trên server. Trước khi deploy, cần chạy lệnh `npm run build` để biên dịch toàn bộ source code thành các file tĩnh (HTML, JS, CSS) đặt trong thư mục `dist/`. Nginx sau đó sẽ phục vụ các file này.

---

## PHẦN 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1. Yêu cầu trước khi bắt đầu

Mỗi học viên cần chuẩn bị sẵn:

**Trên máy cá nhân:**

- Một máy tính có kết nối Internet
- Có cài Terminal:
  - Windows: PowerShell hoặc Windows Terminal
  - macOS/Linux: Terminal mặc định
- Có tài khoản GitHub
- Có tài khoản Docker Hub
- Có cài Git
- Có cài Node.js 18 trở lên:
  ```bash
  node -v
  npm -v
  ```
- Có cài Docker Desktop (dùng từ Lab 2 trở đi)

**Trên máy chủ:**

- Một VPS Ubuntu
- Biết các thông tin:
  - IP VPS
  - username đăng nhập: `root`
  - mật khẩu hoặc SSH Key

### 1.2. Kiểm tra source code

Clone repo về máy (nếu chưa có):

```bash
git clone https://github.com/gianglt-dau/simple-reactjs.git
cd simple-reactjs
```

Cài dependency và kiểm tra ứng dụng chạy được trên máy local:

```bash
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

> **Kết quả mong đợi:** Ứng dụng React hiển thị bình thường trên máy local.

---

## LAB 1. DEPLOY THỦ CÔNG LÊN VPS VỚI NGINX

### 2.1. Mục tiêu

Sau lab này, học viên sẽ:

- Biết build ứng dụng React thành file tĩnh
- Biết cài và cấu hình Nginx trên VPS
- Biết upload file tĩnh lên VPS bằng `scp`
- Biết cấu hình Nginx để phục vụ Single Page Application (SPA)
- Hiểu tại sao React Router cần cấu hình đặc biệt trên server

---

### 2.2. Bước 1: Copy source code lên máy chủ

Mở **Terminal** (PowerShell trên Windows hoặc Terminal trên macOS/Linux), di chuyển vào thư mục dự án và copy source lên máy chủ Ubuntu:

```bash
scp -r . gianglt@localhost:~/simple-reactjs/
```

**Giải thích:**

- `.`: toàn bộ thư mục hiện tại (source code)
- `gianglt@localhost`: username và địa chỉ IP máy chủ Ubuntu
- `~/simple-reactjs/`: thư mục đích trong home directory của máy chủ

> **Kết quả mong đợi:** Các file được copy thành công, không có thông báo lỗi.

---

### 2.3. Bước 2: SSH vào máy chủ

Trong **Terminal**, chạy:

```bash
ssh gianglt@localhost
```

Sau đó SSH lại và nhập mật khẩu khi được nhắc.

> **Kết quả mong đợi:** Đăng nhập thành công vào máy chủ:
> ```
> gianglt@ubuntu-server:~$
> ```

> **Lỗi thường gặp:**
> - `Permission denied`: sai mật khẩu
> - `Connection refused`: dịch vụ SSH chưa chạy (chạy `sudo systemctl start ssh`)
> - `Host key verification failed`: chạy lệnh `ssh-keyscan` ở trên trước

---

### 2.4. Bước 3: Cập nhật hệ điều hành

```bash
sudo apt update && sudo apt upgrade -y
```

> **Kết quả mong đợi:** Cập nhật thành công, không có lỗi nghiêm trọng.

---

### 2.5. Bước 4: Cài đặt Node.js và Nginx

```bash
sudo apt install nodejs npm nginx -y
```

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

Kiểm tra Nginx đang chạy:

```bash
sudo systemctl status nginx
```

> **Kết quả mong đợi:** Trạng thái hiển thị `active (running)`.

Kiểm tra bằng trình duyệt, truy cập `http://localhost`.

> **Kết quả mong đợi:** Thấy trang mặc định **"Welcome to nginx!"**

---

### 2.6. Bước 5: Tạo thư mục chứa file tĩnh

Thư mục `/var/www` thuộc sở hữu của `root`, cần dùng `sudo` để tạo và cấp quyền:

```bash
sudo mkdir -p /var/www/simple-reactjs
sudo chown $USER:$USER /var/www/simple-reactjs
```

**Giải thích:**
- `sudo mkdir`: tạo thư mục với quyền root
- `sudo chown $USER:$USER`: chuyển quyền sở hữu về user hiện tại, để có thể copy file vào mà không cần sudo

---

### 2.7. Bước 6: Build ứng dụng trên máy chủ

Trong phiên SSH vào máy chủ, di chuyển vào thư mục source đã copy ở Bước 1:

```bash
cd ~/simple-reactjs
npm install
npm run build
```

**Giải thích:** `npm run build` kích hoạt Vite biên dịch toàn bộ source code React thành file tĩnh trong thư mục `dist/`.

Kiểm tra kết quả build:

```bash
ls dist/
```

> **Kết quả mong đợi:**
> ```
> assets  index.html
> ```

Copy file build vào thư mục web:

```bash
cp -r dist/* /var/www/simple-reactjs/
```

Kiểm tra lại:

```bash
ls /var/www/simple-reactjs/
```

> **Kết quả mong đợi:**
> ```
> assets  index.html
> ```

---

### 2.8. Bước 7: Cấu hình Nginx cho ứng dụng SPA

Tạo file cấu hình mới cho Nginx:

```bash
sudo nano /etc/nginx/sites-available/simple-reactjs
```

Nhập nội dung sau:

```nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/simple-reactjs;
    index index.html;

    # Handle React Router (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

Nhấn `Ctrl + O` để lưu, `Ctrl + X` để thoát.

**Giải thích dòng quan trọng:**

```nginx
try_files $uri $uri/ /index.html;
```

> Khi người dùng truy cập `/about` hoặc `/dashboard`, Nginx tìm file tương ứng trên đĩa. Nếu không có, nó phục vụ `index.html` để React Router tự xử lý routing phía client. Thiếu dòng này, người dùng sẽ gặp lỗi **404** khi refresh trang hoặc truy cập trực tiếp một URL.

---

### 2.9. Bước 8: Kích hoạt site và khởi động lại Nginx

Tạo symlink để kích hoạt cấu hình:

```bash
sudo ln -s /etc/nginx/sites-available/simple-reactjs /etc/nginx/sites-enabled/
```

Vô hiệu hóa site mặc định của Nginx (tránh xung đột):

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Kiểm tra cú pháp cấu hình:

```bash
sudo nginx -t
```

> **Kết quả mong đợi:**
> ```
> nginx: configuration file /etc/nginx/nginx.conf syntax is ok
> nginx: configuration file /etc/nginx/nginx.conf test is successful
> ```

Khởi động lại Nginx:

```bash
sudo systemctl reload nginx
```

---

### 2.10. Bước 9: Kiểm tra kết quả

Mở trình duyệt trên Windows và truy cập `http://localhost`.

> **Kết quả mong đợi:** Ứng dụng React hiển thị bình thường.

---

### 2.11. Cập nhật ứng dụng (khi có thay đổi code)

Khi có thay đổi mới, từ **Terminal** copy source mới lên máy chủ:

```bash
scp -r . gianglt@localhost:~/simple-reactjs/
```

Rồi SSH vào máy chủ và build lại:

```bash
cd ~/simple-reactjs
npm run build
cp -r dist/* /var/www/simple-reactjs/
```

Không cần restart Nginx — Nginx sẽ tự phục vụ file mới.

---

### 2.12. Kết luận Lab 1

- Ứng dụng React phải được **build trước** thành file tĩnh, không thể chạy trực tiếp source code JSX
- Nginx phục vụ file tĩnh nhanh và hiệu quả, không cần Node.js trên server
- Cần cấu hình `try_files $uri $uri/ /index.html` để React Router hoạt động đúng
- Hạn chế: mỗi lần cập nhật phải build và upload thủ công

---

## LAB 2. ĐÓNG GÓI BẰNG DOCKER VỚI MULTI-STAGE BUILD

### 3.1. Mục tiêu

Sau lab này, học viên sẽ:

- Hiểu khái niệm multi-stage build trong Docker
- Biết đọc và phân tích Dockerfile của ứng dụng React
- Biết build Docker image và push lên Docker Hub
- Biết chạy container trên VPS bằng docker-compose
- Hiểu lợi ích của "build ở local, run ở server"

---

### 3.2. Ý tưởng multi-stage build

Ở Lab 1, bạn cần cài Node.js trên máy local để build, rồi mới có file tĩnh để upload. Có một vấn đề: nếu người khác muốn build, họ cũng phải cài cùng phiên bản Node.js.

**Multi-stage build trong Docker giải quyết điều này:**

- **Stage 1 (builder):** Dùng image Node.js để cài dependency và build ứng dụng React
- **Stage 2 (production):** Chỉ copy kết quả từ Stage 1 vào image Nginx nhỏ gọn

Kết quả: image production **không chứa Node.js**, chỉ chứa Nginx và file tĩnh — rất nhỏ và an toàn.

---

### 3.3. Phân tích Dockerfile của dự án

Mở file `Dockerfile` trong thư mục dự án:

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Giải thích từng phần:**

| Dòng | Nội dung | Giải thích |
|------|----------|------------|
| `FROM node:22-alpine AS builder` | Khai báo Stage 1 | Dùng Node.js 22 bản Alpine (gọn nhẹ) để build |
| `COPY package*.json ./` + `RUN npm ci` | Cài dependency | Copy khai báo thư viện trước để tối ưu Docker cache |
| `npm ci` | Cài đúng phiên bản | Khác với `npm install`, `npm ci` đảm bảo cài đúng version trong lockfile |
| `RUN npm run build` | Build React | Tạo ra thư mục `dist/` |
| `FROM nginx:stable-alpine AS production` | Khai báo Stage 2 | Image mới, sạch, chỉ có Nginx |
| `COPY --from=builder /app/dist ...` | Copy kết quả build | Lấy file từ Stage 1, không cần Node.js nữa |
| `COPY nginx.conf ...` | Cấu hình Nginx | Dùng file nginx.conf tùy chỉnh của dự án |
| `EXPOSE 80` | Khai báo cổng | Container lắng nghe trên cổng 80 |

---

### 3.4. Phân tích file nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router (SPA fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

> File này được copy vào image ở Stage 2, đảm bảo cấu hình Nginx giống hệt nhau ở mọi môi trường.

---

### 3.5. Bước 1: Đăng nhập Docker Hub trên máy local

```bash
docker login
```

Nhập Docker Hub username và password khi được nhắc.

> **Kết quả mong đợi:** `Login Succeeded`

---

### 3.6. Bước 2: Build Docker image

Trong thư mục dự án:

```bash
docker build -t <your_dockerhub_username>/simple-reactjs:v1.0.0 .
```

> **Lưu ý:** Dấu `.` ở cuối là bắt buộc — đại diện cho thư mục hiện tại.

Quan sát quá trình build:

```
[+] Building 45.2s
 => [builder 1/6] FROM node:22-alpine         ...
 => [builder 2/6] WORKDIR /app                ...
 => [builder 3/6] COPY package*.json ./       ...
 => [builder 4/6] RUN npm ci                  ...
 => [builder 5/6] COPY . .                    ...
 => [builder 6/6] RUN npm run build           ...
 => [production 1/3] FROM nginx:stable-alpine ...
 => [production 2/3] COPY --from=builder ...  ...
 => [production 3/3] COPY nginx.conf ...      ...
```

Kiểm tra image:

```bash
docker images
```

> **Kết quả mong đợi:** Thấy image `<username>/simple-reactjs   v1.0.0` với kích thước khoảng **20–30 MB** (rất nhỏ vì không chứa Node.js).

---

### 3.7. Bước 3: Kiểm tra container trên máy local

Chạy thử container trước khi push:

```bash
docker run -d -p 3000:80 --name test-reactjs <your_dockerhub_username>/simple-reactjs:v1.0.0
```

Mở trình duyệt tại `http://localhost:3000`.

> **Kết quả mong đợi:** Ứng dụng React hiển thị bình thường.

Dừng và xóa container test:

```bash
docker stop test-reactjs
docker rm test-reactjs
```

---

### 3.8. Bước 4: Push image lên Docker Hub

```bash
docker push <your_dockerhub_username>/simple-reactjs:v1.0.0
```

> **Kết quả mong đợi:** Image được tải lên Docker Hub thành công.

Truy cập `https://hub.docker.com/r/<your_dockerhub_username>/simple-reactjs` để xác nhận.

---

### 3.9. Bước 5: Chuẩn bị VPS để chạy Docker

SSH vào VPS và cài Docker:

```bash
apt install docker.io docker-compose-plugin -y
docker --version
docker compose version
```

> **Kết quả mong đợi:**
> ```
> Docker version 24.x.x
> Docker Compose version v2.x.x
> ```

---

### 3.10. Bước 6: Tạo docker-compose.yml trên VPS

Tạo thư mục làm việc:

```bash
mkdir -p /opt/simple-reactjs
cd /opt/simple-reactjs
nano docker-compose.yml
```

Nhập nội dung:

```yaml
services:
  app:
    image: <your_dockerhub_username>/simple-reactjs:v1.0.0
    container_name: simple-reactjs
    ports:
      - "80:80"
    restart: unless-stopped
```

> **Lưu ý:** Ở đây map cổng `80:80` — cổng 80 của VPS tới cổng 80 bên trong container (vì Nginx trong container lắng nghe cổng 80). Người dùng có thể truy cập trực tiếp bằng IP mà không cần thêm số cổng.

---

### 3.11. Bước 7: Kéo image và khởi động container

```bash
docker compose pull
docker compose up -d
```

Kiểm tra container đang chạy:

```bash
docker compose ps
```

> **Kết quả mong đợi:**
> ```
> NAME             STATUS    PORTS
> simple-reactjs   Up        0.0.0.0:80->80/tcp
> ```

Mở trình duyệt và truy cập `http://<IP_VPS_CUA_BAN>`.

> **Kết quả mong đợi:** Ứng dụng React hiển thị bình thường.

---

### 3.12. Cập nhật ứng dụng (khi có phiên bản mới)

Trên máy local:

```bash
# Build image mới với tag v1.1.0
docker build -t <your_dockerhub_username>/simple-reactjs:v1.1.0 .
docker push <your_dockerhub_username>/simple-reactjs:v1.1.0
```

Trên VPS, sửa file `docker-compose.yml` (đổi tag thành `v1.1.0`), rồi:

```bash
docker compose pull
docker compose up -d
```

---

### 3.13. Các lệnh Docker quan trọng

| Lệnh | Mô tả |
|------|-------|
| `docker compose ps` | Xem trạng thái container |
| `docker compose logs -f` | Xem log container theo thời gian thực |
| `docker compose down` | Dừng và xóa container |
| `docker compose up -d` | Khởi động container ở chế độ nền |
| `docker images` | Xem danh sách image đã có |
| `docker rmi <image>` | Xóa image |

---

### 3.14. Kết luận Lab 2

- **Multi-stage build** giúp image production nhỏ gọn và bảo mật hơn — chỉ chứa Nginx và file tĩnh
- VPS chỉ cần cài Docker, không cần cài Node.js hay cấu hình Nginx thủ công
- docker-compose giúp quản lý container đơn giản và dễ đọc hơn
- Hạn chế: mỗi lần cập nhật vẫn phải build và push thủ công

---

## LAB 3. TỰ ĐỘNG HÓA CI/CD VỚI GITHUB ACTIONS

### 4.1. Mục tiêu

Sau lab này, học viên sẽ:

- Biết tạo GitHub Secrets để lưu thông tin nhạy cảm
- Biết viết workflow GitHub Actions cho ứng dụng React + Docker
- Hiểu luồng tự động: push code → build image → deploy lên VPS
- Biết quy trình cập nhật và rollback phiên bản

---

### 4.2. Ý tưởng tổng thể

Trước đây, mỗi lần cập nhật cần thực hiện thủ công toàn bộ:

> sửa code → commit → push → `npm run build` → `docker build` → `docker push` → SSH vào VPS → cập nhật `docker-compose.yml` → `docker compose pull` → `docker compose up -d`

**GitHub Actions sẽ tự động hóa toàn bộ chuỗi này, chỉ cần push code là xong.**

---

### 4.3. Bước 1: Tạo Secrets trên GitHub

Vào repository → **Settings → Secrets and variables → Actions → New repository secret**.

Tạo các secret sau:

**Docker Hub:**

| Secret | Giá trị |
|--------|---------|
| `DOCKER_USERNAME` | Username Docker Hub của bạn |
| `DOCKER_PASSWORD` | Password hoặc Access Token Docker Hub |

> **Khuyến nghị bảo mật:** Tạo **Access Token** trên Docker Hub (`Account Settings → Security → Access Tokens`) thay vì dùng password trực tiếp.

**VPS:**

| Secret | Giá trị |
|--------|---------|
| `VPS_HOST` | Địa chỉ IP VPS |
| `VPS_USERNAME` | `root` (hoặc user khác) |
| `VPS_PASSWORD` | Mật khẩu VPS |

---

### 4.4. Bước 2: Tạo workflow CI/CD

Trong thư mục dự án trên máy local, tạo file:

```bash
mkdir -p .github/workflows
```

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: CI/CD — Build & Deploy ReactJS

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-push:
    name: Build Docker Image & Push to Registry
    runs-on: ubuntu-latest
    steps:
      - name: Lấy source code
        uses: actions/checkout@v4

      - name: Đăng nhập Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build và Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }} .
          docker tag ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }} \
                     ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }}
          docker push ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:latest

  deploy-to-vps:
    name: Deploy to VPS
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: SSH vào VPS và Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          password: ${{ secrets.VPS_PASSWORD }}
          script: |
            cd /opt/simple-reactjs

            # Cập nhật tag image mới nhất
            sed -i "s|image:.*|image: ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }}|g" docker-compose.yml

            # Kéo image mới và khởi động lại container
            docker compose pull
            docker compose up -d

            # Dọn dẹp image cũ không dùng
            docker image prune -f
```

---

### 4.5. Giải thích workflow

**Trigger:**

```yaml
on:
  push:
    branches: [ "main" ]
```

Workflow tự động chạy mỗi khi có commit được push lên nhánh `main`.

**Job `build-and-push`:**

1. Checkout source code từ repository
2. Đăng nhập Docker Hub bằng credentials từ Secrets
3. Build image với tag là `github.sha` (hash commit) để có thể theo dõi từng phiên bản
4. Tag thêm `latest` để luôn biết phiên bản mới nhất
5. Push cả hai tag lên Docker Hub

**Job `deploy-to-vps`:**

Chỉ chạy sau khi `build-and-push` thành công (`needs: build-and-push`):

1. SSH vào VPS
2. Dùng `sed` để cập nhật tag image trong `docker-compose.yml`
3. Pull image mới và restart container
4. Xóa image cũ để tiết kiệm dung lượng đĩa

> **Vì sao dùng `${{ github.sha }}`?**
> Mỗi commit có một SHA riêng biệt. Dùng SHA làm tag image giúp biết chính xác commit nào đang chạy trên production và dễ dàng rollback.

---

### 4.6. Bước 3: Commit và push workflow lên GitHub

```bash
git add .
git commit -m "Add CI/CD workflow for React deployment"
git push origin main
```

> **Kết quả mong đợi:** GitHub Actions tự động được kích hoạt ngay sau khi push.

---

### 4.7. Bước 4: Theo dõi pipeline

Trên GitHub, vào tab **Actions** → chọn workflow đang chạy.

Quan sát từng bước:

```
✅ Lấy source code
✅ Đăng nhập Docker Hub
✅ Build và Push Docker Image   ← thường mất 1–3 phút
✅ SSH vào VPS và Deploy
```

Nếu tất cả có dấu màu xanh, deploy thành công.

Mở trình duyệt và truy cập `http://<IP_VPS_CUA_BAN>`.

---

### 4.8. Bước 5: Kiểm tra luồng CI/CD hoạt động

Sửa nội dung một component trong `src/App.jsx`:

```jsx
// Thêm một dòng text bất kỳ để kiểm tra
<p>Version 2 — CI/CD is working!</p>
```

Sau đó:

```bash
git add .
git commit -m "Test CI/CD pipeline"
git push origin main
```

Chờ workflow chạy xong (theo dõi trong tab Actions), rồi reload trình duyệt.

> **Kết quả mong đợi:** Nội dung mới xuất hiện trên website mà không cần làm bất kỳ thao tác nào trên VPS.

---

### 4.9. Bước 6: Rollback khi bản mới có lỗi

Giả sử phiên bản mới vừa deploy bị lỗi. SSH vào VPS và chạy container từ image cũ:

```bash
cd /opt/simple-reactjs
docker compose down

# Chạy lại từ SHA của commit ổn định trước đó
docker run -d -p 80:80 --name simple-reactjs \
  <your_dockerhub_username>/simple-reactjs:<SHA_CU>
```

Lấy SHA của commit cũ từ tab **Actions** trên GitHub — mỗi workflow hiển thị SHA commit tương ứng.

> **Ưu điểm:** Rollback thực hiện trong vài giây, không cần sửa code hay build lại.

---

### 4.10. Tối ưu thêm: Chỉ deploy khi code đã qua kiểm tra

Mở rộng workflow để chạy lint trước khi build:

```yaml
  build-and-push:
    name: Build Docker Image & Push to Registry
    runs-on: ubuntu-latest
    steps:
      - name: Lấy source code
        uses: actions/checkout@v4

      - name: Cài Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Cài dependency
        run: npm ci

      - name: Kiểm tra Lint
        run: npm run lint

      - name: Đăng nhập Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build và Push Docker Image
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }} .
          docker push ${{ secrets.DOCKER_USERNAME }}/simple-reactjs:${{ github.sha }}
```

> Nếu `npm run lint` thất bại, workflow dừng ngay — không build, không deploy. Giúp đảm bảo code chất lượng luôn là thứ được đưa lên production.

---

### 4.11. Kết luận Lab 3

- CI/CD loại bỏ hoàn toàn thao tác thủ công sau khi push code
- Sử dụng `github.sha` làm tag giúp truy vết phiên bản và rollback nhanh chóng
- Secrets trên GitHub bảo vệ thông tin nhạy cảm, không bao giờ xuất hiện trong log

---

## PHẦN 5. TỔNG HỢP KIẾN THỨC SAU 3 LAB

### 5.1. So sánh 3 cách triển khai

|  | Deploy thủ công | Docker | CI/CD |
|---|---|---|---|
| **Ưu điểm** | Dễ hiểu, phù hợp khi mới bắt đầu | Môi trường nhất quán, dễ versioning, VPS sạch | Tự động hóa hoàn toàn, nhanh, ít rủi ro sai sót |
| **Nhược điểm** | Cập nhật thủ công, dễ sai | Cần học Docker, cần build và push thủ công | Cần thiết lập ban đầu kỹ, quản lý Secrets phức tạp |
| **Thời gian deploy** | ~5 phút | ~3 phút | ~2–3 phút (tự động) |
| **Phù hợp với** | Học tập, thử nghiệm nhanh | Cá nhân/team nhỏ | Team, môi trường production |

### 5.2. Luồng dữ liệu qua 3 lab

```
Máy local                 Docker Hub              VPS
-----------               ----------              ---
source code
    │
    │  npm run build (Lab 1)
    ▼
  dist/  ─── scp ──────────────────────────────▶ /var/www/
    │
    │  docker build (Lab 2, 3)
    ▼
  image ──── docker push ──▶ registry ─── pull ──▶ container
    │
    │  git push (Lab 3)
    ▼
GitHub Actions ─────────────────────────────────▶ auto deploy
```

---

## PHẦN 6. BÀI TẬP THỰC HÀNH ĐỀ XUẤT

**Bài tập 1 (Lab 1):** Thêm một trang mới trong React Router, build lại và upload thủ công lên VPS. Kiểm tra xem URL trực tiếp có hoạt động không.

**Bài tập 2 (Lab 2):** Chỉnh `docker-compose.yml` để map cổng `8080:80` thay vì `80:80`. Truy cập bằng `http://<IP_VPS>:8080`.

**Bài tập 3 (Lab 2):** Thêm tag `latest` khi push image lên Docker Hub bằng tay:
```bash
docker tag <user>/simple-reactjs:v1.0.0 <user>/simple-reactjs:latest
docker push <user>/simple-reactjs:latest
```

**Bài tập 4 (Lab 3):** Thêm bước `npm run lint` vào workflow trước khi build. Cố tình tạo lỗi lint và quan sát workflow dừng ở đâu.

**Bài tập 5 (Lab 3):** Cố tình sửa code làm app hiển thị sai, push lên và thực hành rollback về SHA commit trước đó.

---

## PHẦN 7. LỖI THƯỜNG GẶP VÀ CÁCH XỬ LÝ

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|-------------|------------|
| Trang trắng khi truy cập VPS | File build chưa được upload đúng thư mục | Kiểm tra `ls /var/www/simple-reactjs/`, phải có `index.html` |
| 404 khi refresh trang hoặc vào URL trực tiếp | Nginx chưa có `try_files $uri $uri/ /index.html` | Thêm dòng này vào cấu hình Nginx, reload nginx |
| `nginx -t` báo lỗi cú pháp | Sai cú pháp trong file cấu hình | Đọc kỹ thông báo lỗi, kiểm tra lại dấu `;` và `{}` |
| `docker build` thất bại | Lỗi trong source code hoặc `npm ci` thất bại | Đọc log build, kiểm tra `package.json` và `package-lock.json` |
| `docker push` thất bại | Chưa đăng nhập hoặc sai tên image | Chạy `docker login` lại, kiểm tra tên image có đúng format `username/repo:tag` |
| GitHub Actions fail tại bước login Docker | Secret sai | Kiểm tra `DOCKER_USERNAME` và `DOCKER_PASSWORD` trong Settings |
| GitHub Actions fail tại bước SSH | Thông tin VPS sai hoặc VPS chặn SSH bằng password | Kiểm tra `VPS_HOST`, `VPS_USERNAME`, `VPS_PASSWORD`; đảm bảo VPS cho phép `PasswordAuthentication yes` trong `/etc/ssh/sshd_config` |
| Container chạy nhưng web không hiển thị | Cổng chưa được mở trên firewall VPS | Mở cổng 80: `ufw allow 80` hoặc cấu hình Security Group trên cloud provider |
