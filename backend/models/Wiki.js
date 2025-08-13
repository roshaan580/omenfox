const mongoose = require("mongoose");

const wikiSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
wikiSchema.index({ title: "text", content: "text", tags: "text" });

// Update lastModified and capitalize tags on save
wikiSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastModified = Date.now();
  }
  
  // Capitalize tags
  if (this.tags && this.tags.length > 0) {
    this.tags = this.tags.map(tag => {
      if (typeof tag === 'string') {
        return tag.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return tag;
    });
  }
  
  next();
});

module.exports = mongoose.model("Wiki", wikiSchema);