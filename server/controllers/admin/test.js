
// @desc    Créer un produit
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      image,  // Ajouté
      images  // Ajouté (tableau)
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prix et catégorie sont obligatoires'
      });
    }

    const stockNumber = parseInt(stock);
    
    const product = new Product({
      name,
      description: description || '',
      price: parseFloat(price),
      category, // Ici, cela peut être le nom (String) ou l'ID (ObjectId) selon ton modèle choisi
      stock: isNaN(stockNumber) ? 0 : stockNumber,
      inStock: !isNaN(stockNumber) && stockNumber > 0,
      // GESTION DES IMAGES
      image: image || '', // L'image principale
      images: Array.isArray(images) ? images : (image ? [image] : []) // Assure que c'est un tableau
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: createdProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un produit
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé' });

    const updates = { ...req.body };

    if (updates.stock !== undefined) {
      const stockNumber = parseInt(updates.stock);
      updates.stock = isNaN(stockNumber) ? 0 : stockNumber;
      updates.inStock = !isNaN(stockNumber) && stockNumber > 0;
    }

    Object.assign(product, updates);
    const updatedProduct = await product.save();
    res.json({ success: true, message: 'Produit mis à jour', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Supprimer un produit
// @route   DELETE /api/products/:id
// @access  Admin
// const deleteProduct = async (req, res) => {
//   onsole.log("DELETE PRODUCT HIT:", req.params.id); // 👈 TEST
//   console.log("USER:", req.user);
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Produit introuvable'
//       });
//     }

//     await product.deleteOne();

//     res.json({
//       success: true,
//       message: 'Produit supprimé avec succès'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la suppression du produit',
//       error: error.message
//     });
//   }
// };
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Produit introuvable",
    });
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Produit supprimé avec succès",
  });
};
