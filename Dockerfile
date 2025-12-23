# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only the dist folder (production build)
COPY dist/ ./

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the server
CMD ["node", "server.js"]
