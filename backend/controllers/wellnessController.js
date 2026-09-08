const WellnessFAQ = require("../models/WellnessFAQ");
const { categories: defaultCategories, categoryDescriptions, wellnessQAData } = require("../../database/qaData");

// Helper to ensure database has items or fallback gracefully
const getDBOrFallbackCategories = async () => {
  try {
    const dbCategories = await WellnessFAQ.distinct("category", { active: true });
    if (dbCategories && dbCategories.length > 0) {
      // Return distinct categories, matching order of predefined categories where possible
      return defaultCategories.filter(c => dbCategories.includes(c)).concat(
        dbCategories.filter(c => !defaultCategories.includes(c))
      );
    }
  } catch (err) {
    console.warn("DB query for categories failed, using fallback:", err.message);
  }
  return defaultCategories;
};

// @desc    Get all unique categories with details
// @route   GET /api/wellness/categories
// @access  Private (Student)
const getCategories = async (req, res) => {
  try {
    const catList = await getDBOrFallbackCategories();
    
    // Map with descriptions
    const result = catList.map(name => ({
      name,
      description: categoryDescriptions[name] || "Explore practical wellness advice and guidance for this category."
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories." });
  }
};

// @desc    Get all questions for a specific category
// @route   GET /api/wellness/questions/:category
// @access  Private (Student)
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let faqs = [];
    
    try {
      faqs = await WellnessFAQ.find({ category, active: true }).sort({ order: 1 });
    } catch (err) {
      console.warn("DB query for questions failed, using fallback:", err.message);
    }

    if (!faqs || faqs.length === 0) {
      // Fallback to static data filtered by category
      faqs = wellnessQAData.filter(
        item => item.category.toLowerCase() === category.toLowerCase() && item.active !== false
      );
    }

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions." });
  }
};

// @desc    Get a specific question by ID
// @route   GET /api/wellness/question/:id
// @access  Private (Student)
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    let faq = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await WellnessFAQ.findById(id);
    }

    if (!faq) {
      // Try finding by fallback array index or order
      faq = wellnessQAData.find(item => item._id === id || String(item.order) === id);
    }

    if (!faq) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question details." });
  }
};

module.exports = {
  getCategories,
  getQuestionsByCategory,
  getQuestionById,
};
