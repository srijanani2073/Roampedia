import VisitedCountry from "../models/VisitedCountry.js";

export const getVisitedCountries = async (req, res) => {
  const countries = await VisitedCountry.find({ userId: "guest" });
  res.json(countries);
};

export const addVisitedCountry = async (req, res) => {
  const { countryName, region } = req.body;
  const newCountry = new VisitedCountry({ countryName, region });
  await newCountry.save();
  res.status(201).json(newCountry);
};

export const deleteVisitedCountry = async (req, res) => {
  await VisitedCountry.findByIdAndDelete(req.params.id);
  res.json({ message: "Country removed from visited list" });
};
