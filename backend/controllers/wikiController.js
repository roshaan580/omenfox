const Wiki = require("../models/Wiki");
const User = require("../models/User");

// Get all wiki articles
const getAllWikis = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    // Search functionality - more flexible partial matching
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const wikis = await Wiki.find(query)
      .populate("author", "name username email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Wiki.countDocuments(query);

    res.status(200).json({
      success: true,
      data: wikis,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching wikis:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wiki articles",
      error: error.message,
    });
  }
};

// Get single wiki article
const getWikiById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wiki = await Wiki.findById(id)
      .populate("author", "name username email");

    if (!wiki) {
      return res.status(404).json({
        success: false,
        message: "Wiki article not found",
      });
    }

    res.status(200).json({
      success: true,
      data: wiki,
    });
  } catch (error) {
    console.error("Error fetching wiki:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wiki article",
      error: error.message,
    });
  }
};

// Create new wiki article
const createWiki = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const wiki = new Wiki({
      title,
      content,
      tags: tags || [],
      author: userId,
    });

    await wiki.save();
    await wiki.populate("author", "name username email");

    res.status(201).json({
      success: true,
      message: "Wiki article created successfully",
      data: wiki,
    });
  } catch (error) {
    console.error("Error creating wiki:", error);
    res.status(500).json({
      success: false,
      message: "Error creating wiki article",
      error: error.message,
    });
  }
};

// Update wiki article
const updateWiki = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.id;

    const wiki = await Wiki.findById(id);
    if (!wiki) {
      return res.status(404).json({
        success: false,
        message: "Wiki article not found",
      });
    }

    // Check if user is the author or admin
    if (wiki.author.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this article",
      });
    }

    // Update fields
    if (title) wiki.title = title;
    if (content) wiki.content = content;
    if (tags) wiki.tags = tags;

    await wiki.save();
    await wiki.populate("author", "name username email");

    res.status(200).json({
      success: true,
      message: "Wiki article updated successfully",
      data: wiki,
    });
  } catch (error) {
    console.error("Error updating wiki:", error);
    res.status(500).json({
      success: false,
      message: "Error updating wiki article",
      error: error.message,
    });
  }
};

// Delete wiki article
const deleteWiki = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const wiki = await Wiki.findById(id);
    if (!wiki) {
      return res.status(404).json({
        success: false,
        message: "Wiki article not found",
      });
    }

    // Check if user is the author or admin
    if (wiki.author.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this article",
      });
    }

    await Wiki.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Wiki article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wiki:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting wiki article",
      error: error.message,
    });
  }
};

module.exports = {
  getAllWikis,
  getWikiById,
  createWiki,
  updateWiki,
  deleteWiki,
};