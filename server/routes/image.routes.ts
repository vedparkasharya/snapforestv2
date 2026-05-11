import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Image from '../models/Image';
import User from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../utils/cloudinary';

const router = Router();

// AI Image Generation endpoint
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { prompt, style = 'realistic', aspectRatio = '1:1' } = req.body;
    const userId = req.user?.userId;

    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check generations left
    if (user.generationsLeft <= 0 && !user.isPremium) {
      return res.status(403).json({ 
        message: 'No generations left. Please upgrade to premium.',
        code: 'NO_GENERATIONS'
      });
    }

    // Generate unique title
    const title = `AI Generated - ${prompt.substring(0, 30)}...`;

    // In production, this would call an AI image generation API (like Stability AI, DALL-E, etc.)
    // For now, we'll generate a placeholder with a gradient and text overlay
    // The frontend will handle the actual AI generation and send the base64 image

    res.json({
      success: true,
      message: 'Image generation started',
      data: {
        id: uuidv4(),
        prompt,
        style,
        aspectRatio,
        title
      }
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate image' });
  }
});

// Save generated image
router.post('/save', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { imageBase64, prompt, title, style, aspectRatio } = req.body;
    const userId = req.user?.userId;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ message: 'Image and prompt are required' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check generations left
    if (user.generationsLeft <= 0 && !user.isPremium) {
      return res.status(403).json({ 
        message: 'No generations left. Please upgrade to premium.',
        code: 'NO_GENERATIONS'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(imageBase64, 'generated');

    // Save to database
    const image = await Image.create({
      title: title || `AI Art - ${prompt.substring(0, 30)}`,
      prompt,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      userId,
      style: style || 'realistic',
      aspectRatio: aspectRatio || '1:1',
      isPublic: true
    });

    // Decrement generations for free users
    if (!user.isPremium) {
      user.generationsLeft -= 1;
    }
    user.totalGenerations += 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Image saved successfully!',
      image: {
        id: image._id,
        title: image.title,
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        style: image.style,
        aspectRatio: image.aspectRatio,
        createdAt: image.createdAt
      },
      generationsLeft: user.isPremium ? 'unlimited' : user.generationsLeft
    });
  } catch (error: any) {
    console.error('Save image error:', error);
    res.status(500).json({ message: error.message || 'Failed to save image' });
  }
});

// Get user's images
router.get('/my-images', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Image.countDocuments({ userId });

    res.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        title: img.title,
        imageUrl: img.imageUrl,
        prompt: img.prompt,
        style: img.style,
        aspectRatio: img.aspectRatio,
        likes: img.likes,
        downloads: img.downloads,
        createdAt: img.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete image
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const image = await Image.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
