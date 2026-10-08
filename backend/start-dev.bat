@echo off
SET "DB_URL=jdbc:mysql://localhost:3306/car_rental?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
SET "DB_USERNAME=root"
SET "DB_PASSWORD=1234"
SET "JWT_SECRET=CarRentalLocalDevSecretKey2024_MinLen32BytesOK"
SET "JWT_EXPIRATION_SECONDS=86400"
SET "CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001"
SET "SEED_ADMIN_PASSWORD=Admin@123"
SET "SPRING_PROFILES_ACTIVE=dev"

"D:\capston project\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=dev
