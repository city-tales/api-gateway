# API Gateway

A robust, scalable API Gateway built with Node.js, TypeScript, and Express that serves as a single point of entry for all backend microservices. This gateway handles authentication, routing, logging, and provides a unified interface for client applications.

## 🚀 Features

### Authentication & Authorization
- **Multi-channel Authentication**: Support for email, Google OAuth, and passwordless authentication
- **JWT Token Management**: Secure token generation, validation, and refresh mechanisms
- **Email Verification**: Automated email verification with retry functionality
- **Password Reset**: Secure forgot password flow with email notifications
- **Magic Link Authentication**: Passwordless authentication via email magic links

### Infrastructure & Performance
- **Redis Integration**: Caching and queue management with Redis
- **gRPC Communication**: High-performance inter-service communication
- **Queue Management**: Background job processing with BullMQ
- **Logging**: Centralized logging with Winston and Loki
- **Email Services**: Automated email sending with Nodemailer

### Security & Reliability
- **Request Validation**: Input validation using Zod schemas
- **Error Handling**: Comprehensive error handling and status codes
- **Rate Limiting**: Built-in rate limiting capabilities
- **CORS Support**: Cross-origin resource sharing configuration
- **Cookie Management**: Secure HTTP-only cookies for authentication

## 📋 Prerequisites

- Node.js (v18 or higher)
- Redis Server
- TypeScript
- Google OAuth credentials (for Google authentication)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd api-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=1d
   
   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URL=http://localhost:3000/api/authentication/auth/google/callback
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Loki Logging
   LOKI_URL=http://localhost:3100
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🔧 Development

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run pretty` - Format code with Prettier

### Project Structure
```
api-gateway/
├── src/
│   ├── config/          # Configuration files
│   ├── middlewares/     # Express middlewares
│   ├── requests/        # Request handlers
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── views/           # Email templates
├── shared-proto/        # gRPC protocol buffers
├── setup/              # Setup documentation
└── dist/               # Compiled JavaScript
```



## 🔌 External Services Setup

### Redis Setup
See [Redis Setup Guide](setup/cache_db_redis.md) for detailed Redis configuration.

### Google OAuth Setup
See [Google Auth Setup Guide](setup/google_auth_setup.md) for OAuth configuration.

### Email Service Setup
See [Nodemailer Setup Guide](setup/nodemailer.md) for email configuration.

### Logging Setup
See [Loki Logger Setup Guide](setup/loki_logger.md) for centralized logging.

### Queue Management
See [Queue DB Redis Setup Guide](setup/queue_db_redis.md) for background job processing.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly configured for your production environment, especially:
- Database connection strings
- OAuth credentials
- Email service credentials
- JWT secrets
- Logging endpoints

## 🔒 Security Considerations

- All passwords are hashed before storage
- JWT tokens are signed with secure algorithms
- HTTP-only cookies are used for token storage
- CORS is properly configured
- Input validation is enforced on all endpoints
- Rate limiting is implemented to prevent abuse

## 📊 Monitoring & Logging

The application uses Winston with Loki for centralized logging. All authentication attempts, errors, and system events are logged with appropriate labels and context.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ankit Anand**

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This API Gateway is designed to work with microservices architecture. Ensure all dependent services are properly configured and running before starting the gateway.
