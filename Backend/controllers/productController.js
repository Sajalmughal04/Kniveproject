import Product from "../models/Product.js";
import { deleteFromCloudinary } from "../Middleware/uploadMiddleware.js";

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { limit = 100, category, featured, search, minPrice, maxPrice, sort } = req.query;
    
    let query = {};
    
    if (category && category !== "all") {
      query.category = category.toLowerCase();
    }
    
    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption.price = 1;
    else if (sort === 'price_desc') sortOption.price = -1;
    else if (sort === 'title') sortOption.title = 1;
    else sortOption.createdAt = -1;

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

// ✅ Create product - UPDATED FOR MULTIPLE IMAGES
export const createProduct = async (req, res) => {
  try {
    console.log('📝 Create product request:', req.body);
    console.log('👤 Admin user:', req.admin?.email);
    console.log('📁 Uploaded files:', req.files?.length || 0);
    
    const { 
      title, 
      description, 
      price, 
      category, 
      stock, 
      images,
      imageUrls, 
      featured,
      attributes,
      uploadMethod
    } = req.body;

    // Validation
    if (!title || !price || !category) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (title, price, category)",
      });
    }

    let imageArray = [];
    
    // ✅ METHOD 1: Multiple files uploaded via multer
    if (req.files && req.files.length > 0) {
      console.log('✅ Processing', req.files.length, 'uploaded files...');
      
      imageArray = req.files.map(file => ({
        url: file.path, // Cloudinary URL
        alt: title,
        public_id: file.filename || file.originalname
      }));
      
      console.log('✅ Files uploaded to Cloudinary:', imageArray.length);
    }
    // ✅ METHOD 2: Image URLs provided (will be uploaded to Cloudinary)
    else if (imageUrls) {
      let urls = imageUrls;
      
      // Parse if it's a JSON string
      if (typeof imageUrls === 'string') {
        try {
          urls = JSON.parse(imageUrls);
        } catch (e) {
          urls = [imageUrls];
        }
      }
      
      if (!Array.isArray(urls)) {
        urls = [urls];
      }
      
      urls = urls.filter(url => url && url.trim() !== '');
      
      if (urls.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images provided",
        });
      }

      console.log('🔗 Processing', urls.length, 'image URLs...');
      
      // Note: These URLs should be uploaded to Cloudinary by uploadMiddleware
      // If you want to upload external URLs to Cloudinary, you need to use cloudinary.uploader.upload()
      imageArray = urls.map(url => ({
        url: url,
        alt: title
      }));
      
      console.log('✅ Image URLs processed:', imageArray.length);
    }
    // ✅ METHOD 3: Legacy images field support
    else if (images) {
      if (Array.isArray(images)) {
        imageArray = images.map(img => 
          typeof img === "string" ? { url: img, alt: title } : img
        );
      } else if (typeof images === "string") {
        try {
          const parsed = JSON.parse(images);
          imageArray = Array.isArray(parsed) 
            ? parsed.map(img => typeof img === "string" ? { url: img, alt: title } : img)
            : [{ url: images, alt: title }];
        } catch {
          imageArray = [{ url: images, alt: title }];
        }
      }
    }

    // Default placeholder if no images
    if (imageArray.length === 0) {
      console.log('⚠️ No images provided, using placeholder');
      imageArray = [{ 
        url: "https://via.placeholder.com/400", 
        alt: title 
      }];
    }

    // Parse attributes if it's a string
    let parsedAttributes = {};
    if (attributes) {
      if (typeof attributes === 'string') {
        try {
          parsedAttributes = JSON.parse(attributes);
        } catch (e) {
          console.error('Error parsing attributes:', e);
        }
      } else if (typeof attributes === 'object') {
        parsedAttributes = attributes;
      }
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
      title: title.trim(),
      description: description?.trim() || '',
      price: Number(price),
      category: category.toLowerCase(),
      stock: Number(stock) || 0,
      images: imageArray,
      featured: featured === 'true' || featured === true,
      attributes: parsedAttributes,
    });

    console.log('✅ Product created successfully:', product._id);

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

// ✅ Update product - UPDATED FOR MULTIPLE IMAGES
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Update product request for ID:', id);
    console.log('📁 Uploaded files:', req.files?.length || 0);
    
    const updateData = { ...req.body };

    const existingProduct = await Product.findById(id);
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Handle new images upload
    if (req.files && req.files.length > 0) {
      console.log('🔄 Updating product images...');
      
      // Delete old images from Cloudinary
      if (existingProduct.images?.length > 0) {
        console.log('🗑️ Deleting', existingProduct.images.length, 'old images from Cloudinary...');
        for (const image of existingProduct.images) {
          if (image.url && image.url.includes('cloudinary.com')) {
            try {
              await deleteFromCloudinary(image.url);
            } catch (err) {
              console.error('Failed to delete old image:', err);
            }
          }
        }
      }

      // Set new images
      updateData.images = req.files.map(file => ({
        url: file.path,
        alt: updateData.title || existingProduct.title,
        public_id: file.filename || file.originalname
      }));
      
      console.log('✅ New images uploaded:', updateData.images.length);
    }
    // ✅ Handle imageUrls
    else if (updateData.imageUrls) {
      let urls = updateData.imageUrls;
      
      if (typeof urls === 'string') {
        try {
          urls = JSON.parse(urls);
        } catch (e) {
          urls = [urls];
        }
      }
      
      if (!Array.isArray(urls)) {
        urls = [urls];
      }
      
      urls = urls.filter(url => url && url.trim() !== '');
      
      // Delete old images
      if (existingProduct.images?.length > 0) {
        for (const image of existingProduct.images) {
          if (image.url && image.url.includes('cloudinary.com')) {
            try {
              await deleteFromCloudinary(image.url);
            } catch (err) {
              console.error('Failed to delete old image:', err);
            }
          }
        }
      }
      
      updateData.images = urls.map(url => ({
        url: url,
        alt: updateData.title || existingProduct.title
      }));
      
      delete updateData.imageUrls;
    }
    // ✅ Handle legacy images field
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

    // Parse attributes if string
    if (updateData.attributes && typeof updateData.attributes === 'string') {
      try {
        updateData.attributes = JSON.parse(updateData.attributes);
      } catch (e) {
        console.error('Error parsing attributes:', e);
      }
    }

    // Lowercase category
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    // Convert featured to boolean
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    // Remove uploadMethod field (not needed in DB)
    delete updateData.uploadMethod;

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

    // Delete all images from Cloudinary
    if (product.images?.length > 0) {
      console.log('🗑️ Deleting', product.images.length, 'images from Cloudinary...');
      for (const image of product.images) {
        if (image.url && image.url.includes('cloudinary.com')) {
          try {
            await deleteFromCloudinary(image.url);
            console.log('✅ Deleted image from Cloudinary');
          } catch (err) {
            console.error('Failed to delete image:', err);
          }
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

// ✅ Upload product images - UPDATED FOR MULTIPLE
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    console.log('📤 Images uploaded:', req.files.length);

    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename || file.originalname,
      alt: req.body.alt || "Product image"
    }));

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      count: images.length,
      images
    });
  } catch (error) {
    console.error("❌ Upload images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};