import WishlistCountry from "../models/WishlistCountry.js";

export const getWishlist = async (req, res) => {
  const list = await WishlistCountry.find({ userId: "guest" });
  res.json(list);
};

export const addToWishlist = async (req, res) => {
  const { countryName, priority } = req.body;
  const newItem = new WishlistCountry({ countryName, priority });
  await newItem.save();
  res.status(201).json(newItem);
};

export const deleteFromWishlist = async (req, res) => {
  await WishlistCountry.findByIdAndDelete(req.params.id);
  res.json({ message: "Removed from wishlist" });
};
