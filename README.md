# SnapForest V2

AI-powered image generation platform built with React, Node.js, MongoDB, Cloudinary, and Razorpay.

## Features

- **AI Image Generation** - Create stunning images from text prompts
- **Multiple Art Styles** - Realistic, artistic, anime, watercolor, oil painting, sketch, 3D render, digital art
- **Cloud Storage** - All images stored securely on Cloudinary
- **User Authentication** - JWT-based auth with login/register
- **Payment Integration** - Razorpay integration for premium plans
- **Public Gallery** - Share and discover AI-generated artwork
- **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion  
**Backend:** Express.js, MongoDB (Mongoose), Cloudinary, Razorpay  
**Authentication:** JWT tokens with HTTP-only cookies

---

## MANUAL KEY SETUP (Copy-Paste Instructions)

### Step 1: MongoDB URI

Open `.env` file and replace `your_mongodb_uri_here` with:

```
MONGODB_URI=mongodb+srv://Taxnow:22151158045@cluster0.d97vw4f.mongodb.net/snapforestv2?retryWrites=true&w=majority
```

### Step 2: Cloudinary Credentials

In the `.env` file, replace:

```
CLOUDINARY_CLOUD_NAME=dndycmamo
CLOUDINARY_API_KEY=823846521547785
CLOUDINARY_API_SECRET=Di0aPiHuAmbU5jyiSdHKtqWti_8
```

### Step 3: Razorpay Live Keys

In the `.env` file, replace:

```
RAZORPAY_KEY_ID=rzp_live_Snkzxe1jQKvupB
RAZORPAY_KEY_SECRET=D17EWxXsSzCPdqx7CX9Vspnk
```

### Step 4: JWT Secret (Optional)

You can keep the default or set your own:

```
JWT_SECRET=snapforestv2_jwt_secret_key_2024
```

### Step 5: Vercel Environment Variables

For Vercel deployment, add these environment variables in your Vercel dashboard:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://Taxnow:22151158045@cluster0.d97vw4f.mongodb.net/snapforestv2?retryWrites=true&w=majority` |
| `CLOUDINARY_CLOUD_NAME` | `dndycmamo` |
| `CLOUDINARY_API_KEY` | `823846521547785` |
| `CLOUDINARY_API_SECRET` | `Di0aPiHuAmbU5jyiSdHKtqWti_8` |
| `RAZORPAY_KEY_ID` | `rzp_live_Snkzxe1jQKvupB` |
| `RAZORPAY_KEY_SECRET` | `D17EWxXsSzCPdqx7CX9Vspnk` |
| `JWT_SECRET` | `snapforestv2_jwt_secret_key_2024` |
| `NODE_ENV` | `production` |

---

## Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Frontend runs on: http://localhost:3000
# Backend runs on: http://localhost:5000
```

## Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables (see Step 5 above)
4. Deploy!

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/images/generate` | Initiate image generation |
| POST | `/api/images/save` | Save generated image |
| GET | `/api/images/my-images` | Get user's images |
| DELETE | `/api/images/:id` | Delete image |
| GET | `/api/gallery` | Get public gallery |
| GET | `/api/gallery/:id` | Get single image |
| POST | `/api/gallery/:id/like` | Like an image |
| GET | `/api/payments/plans` | Get pricing plans |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/history` | Get payment history |

## License

MIT License - SnapForest Team
