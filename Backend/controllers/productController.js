import Product from "../models/Product.js";
import { deleteFromCloudinary } from "../Middleware/uploadMiddleware.js";

// ✅ Create product - FIXED DISCOUNT HANDLING
export const createProduct = async (req, res) => {
  try {
    console.log('📝 Create product request:', req.body);
    console.log('👤 Admin user:', req.admin?.email);
    console.log('📁 Uploaded files:', req.files?.length || 0);

    // ⭐⭐⭐ ROBUST DATA PARSING ⭐⭐⭐
    let productData = req.body;

    // If productData field exists (from FormData JSON string), parse it
    if (req.body.productData) {
      try {
        console.log('📦 Found productData JSON string, parsing...');
        productData = JSON.parse(req.body.productData);
      } catch (error) {
        console.error('❌ Failed to parse productData:', error);
        return res.status(400).json({
          success: false,
          message: "Invalid product data format",
        });
      }
    }

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
      uploadMethod,
      discountType,
      discountValue
    } = productData;

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
        url: file.path,
        alt: title,
        public_id: file.filename || file.originalname
      }));

      console.log('✅ Files uploaded to Cloudinary:', imageArray.length);
    }
    // ✅ METHOD 2: Image URLs provided
    else if (imageUrls) {
      let urls = imageUrls;

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

    // ⭐⭐⭐ IMPROVED DISCOUNT PROCESSING ⭐⭐⭐
    let finalDiscountType = (discountType || 'none').toString().toLowerCase().trim();
    let finalDiscountValue = 0;

    // Validate discount type
    if (!['percentage', 'fixed', 'none'].includes(finalDiscountType)) {
      console.log('⚠️ Invalid discount type, defaulting to none:', discountType);
      finalDiscountType = 'none';
    }

    // Parse discount value
    if (discountValue !== undefined && discountValue !== null && discountValue !== '') {
      finalDiscountValue = parseFloat(discountValue);
      if (isNaN(finalDiscountValue) || finalDiscountValue < 0) {
        console.log('⚠️ Invalid discount value, setting to 0:', discountValue);
        finalDiscountValue = 0;
      }
    }

    // Force value to 0 if type is 'none'
    if (finalDiscountType === 'none') {
      finalDiscountValue = 0;
    }

    console.log('💰 Final Discount Data:', {
      type: finalDiscountType,
      value: finalDiscountValue,
      originalType: discountType,
      originalValue: discountValue
    });

    console.log('📦 Creating product with data:', {
      title,
      price: Number(price),
      category,
      stock,
      imageCount: imageArray.length,
      discountType: finalDiscountType,
      discountValue: finalDiscountValue
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
      discountType: finalDiscountType,
      discountValue: finalDiscountValue
    });

    console.log('✅ Product created successfully:', product._id);
    console.log('💵 Original Price:', product.price);
    console.log('🏷️ Discount Type:', product.discountType);
    console.log('💰 Discount Value:', product.discountValue);

    // Calculate final price manually for response
    let calculatedFinalPrice = product.price;
    if (product.discountType === 'percentage' && product.discountValue > 0) {
      calculatedFinalPrice = product.price - (product.price * product.discountValue / 100);
    } else if (product.discountType === 'fixed' && product.discountValue > 0) {
      calculatedFinalPrice = product.price - product.discountValue;
    }

    const hasDiscount = product.discountValue > 0 && product.discountType !== 'none';

    console.log('💸 Calculated Final Price:', calculatedFinalPrice);
    console.log('🎯 Has Discount:', hasDiscount);

    // Return product with calculated fields
    const productResponse = {
      ...product.toObject(),
      finalPrice: calculatedFinalPrice,
      hasDiscount: hasDiscount,
      savings: hasDiscount ? (product.price - calculatedFinalPrice) : 0
    };

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: productResponse
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

// ✅ Update product - FIXED DISCOUNT HANDLING
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📝 Update product request for ID:', id);
    console.log('📁 Uploaded files:', req.files?.length || 0);
    console.log('📋 Request body:', req.body);

    // ⭐⭐⭐ ROBUST DATA PARSING ⭐⭐⭐
    let updateData = { ...req.body };

    // If productData field exists (from FormData JSON string), parse it and merge
    if (req.body.productData) {
      try {
        console.log('📦 Found productData JSON string, parsing...');
        const parsedData = JSON.parse(req.body.productData);
        updateData = { ...updateData, ...parsedData };
        // Remove the raw string field
        delete updateData.productData;
      } catch (error) {
        console.error('❌ Failed to parse productData:', error);
        return res.status(400).json({
          success: false,
          message: "Invalid product data format",
        });
      }
    }

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

      updateData.images = req.files.map(file => ({
        url: file.path,
        alt: updateData.title || existingProduct.title,
        public_id: file.filename || file.originalname
      }));

      console.log('✅ New images uploaded:', updateData.images.length);
    }
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

    if (updateData.attributes && typeof updateData.attributes === 'string') {
      try {
        updateData.attributes = JSON.parse(updateData.attributes);
      } catch (e) {
        console.error('Error parsing attributes:', e);
      }
    }

    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase();
    }

    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    // ⭐⭐⭐ IMPROVED DISCOUNT HANDLING ⭐⭐⭐
    if (updateData.discountType !== undefined) {
      updateData.discountType = (updateData.discountType || 'none').toString().toLowerCase().trim();
      if (!['percentage', 'fixed', 'none'].includes(updateData.discountType)) {
        updateData.discountType = 'none';
      }
      console.log('🏷️ Updating discount type:', updateData.discountType);
    }

    if (updateData.discountValue !== undefined) {
      const parsedValue = parseFloat(updateData.discountValue);
      updateData.discountValue = (isNaN(parsedValue) || parsedValue < 0) ? 0 : parsedValue;
      console.log('💰 Updating discount value:', updateData.discountValue);
    }

    // If discount type is being set to 'none', force value to 0
    if (updateData.discountType === 'none') {
      updateData.discountValue = 0;
    }

    delete updateData.uploadMethod;

    console.log('📦 Final update data:', {
      title: updateData.title,
      price: updateData.price,
      discountType: updateData.discountType,
      discountValue: updateData.discountValue
    });

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Product updated:', product._id);
    console.log('💵 Price:', product.price);
    console.log('🏷️ Discount:', product.discountType, '-', product.discountValue);

    // Calculate final price for response
    let calculatedFinalPrice = product.price;
    if (product.discountType === 'percentage' && product.discountValue > 0) {
      calculatedFinalPrice = product.price - (product.price * product.discountValue / 100);
    } else if (product.discountType === 'fixed' && product.discountValue > 0) {
      calculatedFinalPrice = product.price - product.discountValue;
    }

    const hasDiscount = product.discountValue > 0 && product.discountType !== 'none';

    console.log('💸 Final Price:', calculatedFinalPrice);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...product.toObject(),
        finalPrice: calculatedFinalPrice,
        hasDiscount: hasDiscount,
        savings: hasDiscount ? (product.price - calculatedFinalPrice) : 0
      }
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

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.url && image.url.includes('cloudinary.com')) {
          await deleteFromCloudinary(image.url);
        }
      }
    }

    await product.deleteOne();

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

// ✅ Get all products with filtering
export const getAllProducts = async (req, res) => {
  try {
    const { featured, category, limit } = req.query;

    const query = {};

    if (featured === 'true') {
      query.featured = true;
    }

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    let mongooseQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit) {
      const limitVal = parseInt(limit);
      if (!isNaN(limitVal) && limitVal > 0) {
        mongooseQuery = mongooseQuery.limit(limitVal);
      }
    }

    const products = await mongooseQuery;

    // Calculate final prices
    const productsWithFinalPrice = products.map(product => {
      let finalPrice = product.price;
      let hasDiscount = false;

      if (product.discountType && product.discountType !== 'none' && product.discountValue > 0) {
        hasDiscount = true;
        if (product.discountType === 'percentage') {
          finalPrice = product.price - (product.price * product.discountValue / 100);
        } else {
          finalPrice = product.price - product.discountValue;
        }
      }

      return {
        ...product.toObject(),
        finalPrice,
        hasDiscount,
        savings: product.price - finalPrice
      };
    });

    res.status(200).json({
      success: true,
      products: productsWithFinalPrice,
    });
  } catch (error) {
    console.error("❌ Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate final price
    let finalPrice = product.price;
    let hasDiscount = false;

    if (product.discountType && product.discountType !== 'none' && product.discountValue > 0) {
      hasDiscount = true;
      if (product.discountType === 'percentage') {
        finalPrice = product.price - (product.price * product.discountValue / 100);
      } else {
        finalPrice = product.price - product.discountValue;
      }
    }

    const productWithPrice = {
      ...product.toObject(),
      finalPrice,
      hasDiscount,
      savings: product.price - finalPrice
    };

    res.status(200).json({
      success: true,
      product: productWithPrice,
    });
  } catch (error) {
    console.error("❌ Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    console.error("❌ Upload image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

export const updateProductDiscount = async (req, res) => {
  try {
    const { discountType, discountValue } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.discountType = discountType;
    product.discountValue = discountValue;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Discount updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Update discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discount",
      error: error.message,
    });
  }
};

export const removeProductDiscount = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.discountType = 'none';
    product.discountValue = 0;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Discount removed successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Remove discount error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove discount",
      error: error.message,
    });
  }
};