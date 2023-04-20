import Category from "../models/category.js";

const getAllCategories = async (req, res) => {
  const categoryList = await Category.find({});

  if (!categoryList)
    res
      .status(500)
      .json({ success: false, message: "Cannot fetch categories" });
  res.status(200).json({ success: true, categoryList });
};

const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category)
    res.status(500).json({
      success: false,
      message: "The categry with the given ID was not found",
    });
  res.status(200).json({ success: true, category });
};

const addCategory = async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  await category
    .save()
    .then((createdCategory) => {
      if (!createdCategory)
        res.status(404).json({
          error: true,
          message: "The category couldn't be created",
        });
      res.status(201).json({
        error: false,
        createdCategory,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: true,
        data: err,
        success: false,
      });
    });
};

const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    {
      new: true,
    }
  );

  if (!category)
    res.status(500).json({
      success: false,
      message: "The categry with the given ID was not found",
    });
  res
    .status(200)
    .json({ success: true, category, message: "Category Updated" });
};

const deleteCategory = (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "Category is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category not found!" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: true, data: err, success: false });
    });
};

export {
  getAllCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
};
