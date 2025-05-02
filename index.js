const path = require("path")
const express = require("express");
const mongoose = require("mongoose");
const connectMongoDB = require("./connection");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = 8005;

connectMongoDB("mongodb://localhost:27017/YourDailyBlog");

app.set('view engine', "ejs");
app.set("views", path.resolve(("./views")));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});


app.get("/", (req, res) => {
    return res.render("home", {
        user: req.user,
    });
})

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});