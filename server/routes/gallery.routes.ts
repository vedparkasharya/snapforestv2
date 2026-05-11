import { Router } from 'express';
import Image from '../models/Image';

const router = Router();

// Get public gallery images
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const style = req.query.style as string;

    const query: any = { isPublic: true };
    if (style && style !== 'all') {
      query.style = style;
    }

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name avatar');

    const total = await Image.countDocuments(query);

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
        createdAt: img.createdAt,
        user: img.userId
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

// Get single image
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({
      success: true,
      image: {
        id: image._id,
        title: image.title,
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        style: image.style,
        aspectRatio: image.aspectRatio,
        likes: image.likes,
        downloads: image.downloads,
        createdAt: image.createdAt,
        user: image.userId
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Like image
router.post('/:id/like', async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({
      success: true,
      likes: image.likes
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
