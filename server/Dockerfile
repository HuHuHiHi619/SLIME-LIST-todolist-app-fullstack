# ใช้ base image ที่มี Node.js พร้อม
FROM node:18-alpine

# ตั้ง working directory
WORKDIR /app

# แค่ copy package.json ก่อน เพื่อใช้ layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# ติดตั้ง nodemon หากใช้ dev mode
RUN npm install -g nodemon

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Run app
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then nodemon server.js; else node server.js; fi"]