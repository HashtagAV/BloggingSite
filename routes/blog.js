const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/my-blog", async (req, res) => {
    if (!req.user) {
      return res.redirect("/user/signin");
    }
  
    try {
      const blogs = await Blog.find({ createdBy: req.user._id });
      res.render("my-blogs", { blogs, user: req.user });
    } catch (error) {
      console.error("Error fetching user blogs:", error);
      res.status(500).send("Internal Server Error");
    }
  });

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});


router.post('/delete/:id', async (req, res) => {
    const blogId = req.params.id;
    await Blog.findByIdAndDelete(blogId)
      .then(() => {
        res.redirect('/blog/my-blog');
      })
      .catch((err) => {
        console.error('Error deleting blog post:', err);
        res.status(500).send('Error deleting blog post');
      });
  });
  

router.get('/edit/:id', async (req, res) => {
    try {
      const blogId = req.params.id;
      
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        return res.status(404).send('Blog not found');
      }
  
      res.render('editBlog', { blog });
    } catch (err) {
      console.error('Error retrieving blog:', err);
      res.status(500).send('Error retrieving blog');
    }
  });

  

router.post('/edit/:id', upload.single('coverImage'), async (req, res) => {
    try {
      const blogId = req.params.id;
      const { title, body } = req.body;
      const updatedData = { title, body };
  
      if (req.file) {
        updatedData.coverImageURL = `/uploads/${req.file.filename}`;
      }
  
      const blog = await Blog.findByIdAndUpdate(blogId, updatedData, { new: true });
  
      res.redirect(`/blog/${blog._id}`);
    } catch (err) {
      console.error('Error updating blog:', err);
      res.status(500).send('Error updating blog');
    }
  });
  


router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

module.exports = router;
