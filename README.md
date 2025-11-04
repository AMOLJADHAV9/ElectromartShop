# ElectroMart

An e-commerce platform for electronic components and gadgets built with React, TypeScript, Firebase, and Razorpay.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Folder Structure](#folder-structure)
- [Key Components](#key-components)
- [Firebase Structure](#firebase-structure)
- [Payment Integration](#payment-integration)
- [Admin Panel](#admin-panel)
- [Order Management](#order-management)

## Project Overview

ElectroMart is a full-featured e-commerce platform designed for selling electronic components, Arduino boards, sensors, and other tech gadgets. The platform provides a seamless shopping experience for customers and comprehensive management tools for administrators.

## Features

### Customer Features
- User authentication (registration/login)
- Product browsing and search
- Shopping cart functionality
- Secure payment processing with Razorpay
- Order tracking and history
- Invoice generation
- Responsive design for all devices

### Admin Features
- Dashboard with sales analytics
- Product management (CRUD operations)
- Order management with status tracking
- User management
- Real-time data updates
- Revenue monitoring

## Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication & Firestore)
- **Payment**: Razorpay
- **Deployment**: Vite
- **State Management**: React Context API
- **Charting**: Recharts

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Electromart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update configuration in `client/lib/firebase.ts`

### Razorpay Integration
1. Create a Razorpay account
2. Obtain API keys
3. Configure in `client/lib/razorpay.ts`

## Folder Structure

```
client/
├── components/          # Reusable UI components
├── contexts/            # React context providers
├── lib/                 # Utility functions and configurations
├── pages/               # Page components
└── global.css           # Global styles
```

## Key Components

### Core Pages
- `Home.tsx` - Main landing page
- `Products.tsx` - Product listing and browsing
- `ProductDetails.tsx` - Individual product view
- `Cart.tsx` - Shopping cart functionality
- `Orders.tsx` - Order history for customers
- `OrderDetails.tsx` - Detailed order tracking
- `Login.tsx` - User authentication
- `Admin.tsx` - Admin dashboard
- `AdminLogin.tsx` - Admin authentication

### Context Providers
- `CartContext.tsx` - Shopping cart state management

### Utility Libraries
- `firebase.ts` - Firebase configuration and initialization
- `razorpay.ts` - Payment processing integration
- `invoice.ts` - Invoice generation functionality

## Firebase Structure

### Collections
1. **products**
   - name: string
   - category: string
   - price: number
   - stock: number
   - rating: number
   - sales: number
   - image: string (URL)

2. **orders**
   - userId: string
   - products: array
   - totalAmount: number
   - paymentId: string
   - paymentStatus: string
   - deliveryAddress: object
   - orderStatus: string
   - statusTimeline: array
   - createdAt: timestamp

3. **users** (if implemented)
   - name: string
   - email: string
   - joinDate: string
   - totalOrders: number
   - totalSpent: number

## Payment Integration

The platform uses Razorpay for secure payment processing:
1. Cart checkout with delivery address collection
2. Razorpay checkout creation
3. Payment processing with verification
4. Order creation in Firestore upon successful payment

## Admin Panel

### Dashboard Features
- Revenue statistics
- Order tracking
- Product inventory monitoring
- User activity overview
- Sales charts and analytics

### Management Capabilities
- Add/Edit/Delete products
- Update order statuses
- View user information
- Monitor sales performance

## Order Management

### Order Status Lifecycle
1. ORDER_PLACED
2. CONFIRMED
3. PACKED
4. SHIPPED
5. OUT_FOR_DELIVERY
6. DELIVERED

### Tracking Features
- Real-time status updates
- Visual progress indicator
- Status timeline with timestamps
- Invoice download capability