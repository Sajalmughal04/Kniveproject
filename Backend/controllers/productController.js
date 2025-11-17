import Product from "../models/Product.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { limit = 100, category, featured, search, minPrice, maxPrice, sort } = req.query;
    
    let query = {};
    
    // Category filter
    if (category && category !== "all") {
      query.category = category.toLowerCase();
    }
    
    // Featured filter
    if (featured === "true") {
      query.featured = true;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'title') sortOption.title = 1;
    else sortOption.createdAt = -1; // Default: newest first

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ✅ Get single product by ID or slug
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it's a valid MongoDB ID or slug
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ✅ Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({ 
      category: category.toLowerCase() 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ✅ Create product (with Cloudinary support)
export const createProduct = async (req, res) => {
  try {
    console.log('📝 Create product request:', req.body);
    console.log('👤 Admin user:', req.admin?.email);
    console.log('📁 Uploaded file:', req.file);
    
    const { 
      title, 
      description, 
      price, 
      category, 
      stock, 
      images, 
      featured,
      attributes 
    } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (title, description, price, category)",
      });
    }

    // Handle images
    let imageArray = [];
    
    // If file uploaded via multer (Cloudinary or local)
    if (req.file) {
      imageArray.push({
        url: req.file.path, // Cloudinary URL or local path
        alt: title,
        public_id: req.file.filename || req.file.originalname
      });
    }
    // If images sent as JSON array
    else if (images) {
      if (Array.isArray(images)) {
        imageArray = images.map(img => 
          typeof img === "string" ? { url: img, alt: title } : img
        );
      } else if (typeof images === "string") {
        try {
          // Try parsing if it's a JSON string
          const parsed = JSON.parse(images);
          imageArray = Array.isArray(parsed) 
            ? parsed.map(img => typeof img === "string" ? { url: img, alt: title } : img)
            : [{ url: images, alt: title }];
        } catch {
          // If not JSON, treat as single URL
          imageArray = [{ url: images, alt: title }];
        }
      }
    }

    // Default image if none provided
    if (imageArray.length === 0) {
      imageArray = [{ 
        url: "https://via.placeholder.com/400", 
        alt: title 
      }];
    }

    console.log('📦 Creating product with data:', {
      title,
      price,
      category,
      stock,
      imageCount: imageArray.length,
      images: imageArray
    });

    const product = await Product.create({
      title,
      description,
      price,
      category: category.toLowerCase(),
      stock: stock || 0,
      images: imageArray,
      featured: featured || false,
      attributes: attributes || {},
    });

    console.log('✅ Product created:', product._id);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ✅ Update product (with Cloudinary support)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Update product request:', req.body);
    console.log('📁 Uploaded file:', req.file);
    
    const updateData = { ...req.body };

    // Get existing product
    const existingProduct = await Product.findById(id);
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old images from Cloudinary if using Cloudinary
      if (process.env.STORAGE_TYPE === 'cloudinary' && existingProduct.images?.length > 0) {
        for (const image of existingProduct.images) {
          if (image.url && image.url.includes('cloudinary.com')) {
            await deleteFromCloudinary(image.url);
          }
        }
      }

      // Set new image
      updateData.images = [{
        url: req.file.path,
        alt: updateData.title || existingProduct.title,
        public_id: req.file.filename || req.file.originalname
      }];
    }
    // Handle images update from JSON
    else if (updateData.images) {
      if (Array.isArray(updateData.images)) {
        updateData.images = updateData.images.map(img =>
          typeof img === "string" ? { url: img, alt: updateData.title || existingProduct.title } : img
        );
      } else if (typeof updateData.images === "string") {
        try {
          const parsed = JSON.parse(updateData.images);
          updateData.images = Array.isArray(parsed)
            ? parsed.map(img => typeof img === "string" ? { url: img, alt: updateData.title || existingProduct.title } : img)
            : [{ url: updateData.images, alt: updateData.title || existingProduct.title }];
        } catch {
          updateData.images = [{ url: updateData.images, alt: updateData.title || existingProduct.title }];
        }
      }
    }

    // Lowercase category
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Product updated:', product._id);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ✅ Delete product (with Cloudinary cleanup)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary if using Cloudinary
    if (process.env.STORAGE_TYPE === 'cloudinary' && product.images?.length > 0) {
      console.log('🗑️ Deleting images from Cloudinary...');
      for (const image of product.images) {
        if (image.url && image.url.includes('cloudinary.com')) {
          await deleteFromCloudinary(image.url);
        }
      }
    }

    await product.deleteOne();

    console.log('✅ Product deleted:', id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// ✅ Upload product image (separate endpoint for image upload)
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    console.log('📤 Image uploaded:', req.file);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: req.file.path,
      image: {
        url: req.file.path,
        public_id: req.file.filename || req.file.originalname,
        alt: req.body.alt || "Product image"
      }
    });
  } catch (error) {
    console.error("❌ Upload image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};