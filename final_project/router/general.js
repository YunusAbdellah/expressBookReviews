const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 2: Get all books (Promise)
public_users.get('/', (req, res) => {
  new Promise((resolve) => resolve(books))
    .then((allBooks) => res.status(200).send(JSON.stringify(allBooks, null, 4)))
    .catch(() => res.status(500).json({ message: "Error retrieving books" }));
});

// Task 3: Get book by ISBN (Promise)
public_users.get('/isbn/:isbn', (req, res) => {
  new Promise((resolve, reject) => {
    const book = books[req.params.isbn];
    if (book) resolve(book);
    else reject("Book not found");
  })
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Task 4: Get books by author (async/await)
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].author.toLowerCase() === author)
      .map((isbn) => ({ isbn, ...books[isbn] }));
    if (result.length === 0) {
      return res.status(404).json({ message: "No books found for this author" });
    }
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 5: Get books by title (async/await)
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].title.toLowerCase() === title)
      .map((isbn) => ({ isbn, ...books[isbn] }));
    if (result.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 6: Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

// Task 11: Axios client functions (Promise callbacks and async/await)
const BASE_URL = 'http://localhost:5000';

const getAllBooks = () =>
  axios.get(`${BASE_URL}/`).then((response) => response.data);

const getBookByISBN = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${isbn}`).then((response) => response.data);

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

module.exports.general = public_users;
module.exports.axiosClient = { getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };